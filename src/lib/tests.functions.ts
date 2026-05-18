import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const LANGS = ["hi", "bn", "ta", "te", "mr", "gu", "kn", "ml", "pa", "en"] as const;

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
