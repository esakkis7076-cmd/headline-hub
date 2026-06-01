import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateText, Output } from "ai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const LANGS = ["hi", "bn", "ta", "te", "mr", "gu", "kn", "ml", "pa", "en"] as const;
type Lang = (typeof LANGS)[number];
const LANG_NAMES: Record<Lang, string> = {
  hi: "Hindi", bn: "Bengali", ta: "Tamil", te: "Telugu", mr: "Marathi",
  gu: "Gujarati", kn: "Kannada", ml: "Malayalam", pa: "Punjabi", en: "English",
};

export const listTests = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("headline_tests")
      .select("*, headline_variants(*)")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return { tests: data ?? [] };
  });

export const getTest = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: test, error } = await supabase
      .from("headline_tests")
      .select("*, headline_variants(*)")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { test };
  });

export const createTest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        article_url: z.string().url().max(500),
        article_title: z.string().max(300).optional(),
        section: z.string().max(80).optional(),
        language: z.enum(LANGS),
        variants: z
          .array(
            z.object({
              text: z.string().min(1).max(300),
              is_control: z.boolean().optional(),
            }),
          )
          .min(2)
          .max(4),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: profile } = await supabase
      .from("profiles")
      .select("publication_id")
      .eq("user_id", userId)
      .maybeSingle();
    if (!profile?.publication_id) throw new Error("Create a publication first");

    const { data: test, error } = await supabase
      .from("headline_tests")
      .insert({
        publication_id: profile.publication_id,
        created_by: userId,
        article_url: data.article_url,
        article_title: data.article_title,
        section: data.section,
        language: data.language,
        status: "running",
        started_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw new Error(error.message);

    const rows = data.variants.map((v, i) => ({
      test_id: test.id,
      variant_label: String.fromCharCode(65 + i),
      headline_text: v.text,
      is_control: v.is_control ?? i === 0,
    }));
    const { error: vErr } = await supabase.from("headline_variants").insert(rows);
    if (vErr) throw new Error(vErr.message);

    return { test };
  });

export const suggestHeadlines = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      article_url: z.string().url().max(500),
      article_title: z.string().max(300).optional(),
      language: z.enum(LANGS),
      control: z.string().max(300).optional(),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("AI gateway not configured");
    const gateway = createOpenAICompatible({
      name: "lovable",
      baseURL: "https://ai.gateway.lovable.dev/v1",
      apiKey,
      headers: { "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    });
    const model = gateway("google/gemini-2.5-flash");
    const langName = LANG_NAMES[data.language];
    const { experimental_output: out } = await generateText({
      model,
      system: `You are a headline expert for Indian news publishers. Write punchy, click-worthy, factually grounded headlines in ${langName} (native script). 60-90 chars. No clickbait lies. Mix angles: curiosity, number, emotional, breaking.`,
      prompt: `Article URL: ${data.article_url}
Article title: ${data.article_title ?? "(unknown)"}
Original headline (control): ${data.control ?? "(none)"}

Generate 3 alternative headlines in ${langName} that would out-perform the control on CTR while staying truthful. Label each variant with a short angle tag.`,
      experimental_output: Output.object({
        schema: z.object({
          variants: z.array(z.object({
            angle: z.string(),
            text: z.string(),
          })).min(3).max(3),
        }),
      }),
    });
    return { variants: out.variants };
  });

export const endTest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: variants, error: vErr } = await supabase
      .from("headline_variants").select("*").eq("test_id", data.id);
    if (vErr) throw new Error(vErr.message);
    if (!variants || variants.length === 0) throw new Error("No variants");
    const winner = variants.reduce((a, b) => (a.ctr > b.ctr ? a : b));
    const { error } = await supabase
      .from("headline_tests")
      .update({ status: "completed", ended_at: new Date().toISOString(), winner_variant_id: winner.id })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true, winner_id: winner.id };
  });

export const simulateImpressions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: variants, error } = await supabase
      .from("headline_variants").select("*").eq("test_id", data.id);
    if (error) throw new Error(error.message);
    if (!variants) return { ok: true };
    for (const v of variants) {
      const addImp = 800 + Math.floor(Math.random() * 1200);
      const baseCtr = 0.05 + Math.random() * 0.12;
      const addClicks = Math.floor(addImp * baseCtr);
      const newImp = v.impressions + addImp;
      const newClicks = v.clicks + addClicks;
      await supabase.from("headline_variants").update({
        impressions: newImp,
        clicks: newClicks,
        ctr: Number((newClicks / newImp).toFixed(4)),
        avg_dwell_time_sec: 18 + Math.random() * 20,
      }).eq("id", v.id);
    }
    return { ok: true };
  });
