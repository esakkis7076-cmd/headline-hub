import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateObject } from "ai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const LANGS = ["hi", "bn", "ta", "te", "mr", "gu", "kn", "ml", "pa", "en"] as const;
type Lang = (typeof LANGS)[number];

const LANG_NAMES: Record<Lang, string> = {
  hi: "Hindi",
  bn: "Bengali",
  ta: "Tamil",
  te: "Telugu",
  mr: "Marathi",
  gu: "Gujarati",
  kn: "Kannada",
  ml: "Malayalam",
  pa: "Punjabi",
  en: "English",
};

const AeoSchema = z.object({
  overall_score: z.number().int().min(0).max(100),
  position_zero_summary: z.string(),
  faqs: z.array(z.object({ question: z.string(), answer: z.string() })).min(3).max(4),
  headlines: z.object({
    discover: z.string(),
    seo: z.string(),
    social: z.string(),
  }),
  discover_ready: z.boolean(),
  discover_checks: z.array(
    z.object({ label: z.string(), pass: z.boolean(), note: z.string().optional() }),
  ),
  recommendations: z.array(z.string()).min(3).max(8),
});

function buildFaqSchema(
  faqs: { question: string; answer: string }[],
  url: string,
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    url,
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

async function fetchArticleText(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "TestKaroBot/1.0 (+https://testkaro.in)" },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return "";
    const html = await res.text();
    // Strip scripts/styles, then tags. Keep it lightweight.
    const cleaned = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    return cleaned.slice(0, 12000);
  } catch {
    return "";
  }
}

export const analyzeArticle = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        article_url: z.string().url().max(500),
        language: z.enum(LANGS),
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

    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("AI gateway not configured");

    const articleText = await fetchArticleText(data.article_url);

    const gateway = createOpenAICompatible({
      name: "lovable",
      baseURL: "https://ai.gateway.lovable.dev/v1",
      apiKey,
      supportsStructuredOutputs: true,
      headers: {
        "X-Lovable-AIG-SDK": "vercel-ai-sdk",
      },
    });
    const model = gateway("google/gemini-2.5-flash");

    const langName = LANG_NAMES[data.language];
    const system = `You are TestKaro's AEO (Answer Engine Optimization) expert helping Indian news publishers rank in Google Discover, Google Search AI Overviews, ChatGPT, and Perplexity.
You always reply with content in ${langName} (script appropriate for ${langName}). JSON keys stay in English; values are in ${langName}.
Be specific and concrete. Avoid generic SEO advice.`;

    const prompt = `Analyze this article for Answer Engine Optimization and Google Discover readiness.

URL: ${data.article_url}
Target language: ${langName}

ARTICLE CONTENT (may be truncated):
${articleText || "(could not fetch article — base analysis on the URL slug and your knowledge)"}

Return:
- overall_score: 0-100 AEO score
- position_zero_summary: a 40-55 word featured-snippet-ready summary in ${langName}
- faqs: 4-6 Q&A pairs in ${langName} that an answer engine would surface
- discover_ready: boolean
- discover_checks: 5-7 specific checks (e.g., "E-E-A-T author byline present", "High-quality 1200x800 image", "Headline under 90 chars") with pass/fail and a one-line note
- recommendations: 4-6 prioritized action items in ${langName}`;

    const { object: out } = await generateObject({
      model,
      schema: AeoSchema,
      schemaName: "aeo_analysis",
      schemaDescription: "A complete AEO and Google Discover readiness report with the exact requested fields.",
      system,
      prompt,
      temperature: 0.2,
    });

    const faqSchema = buildFaqSchema(out.faqs, data.article_url);

    const { data: row, error } = await supabase
      .from("aeo_analyses")
      .insert({
        publication_id: profile.publication_id,
        created_by: userId,
        article_url: data.article_url,
        language: data.language,
        overall_score: out.overall_score,
        position_zero_summary: out.position_zero_summary,
        faq_schema: faqSchema as never,
        discover_ready: out.discover_ready,
        discover_checks: out.discover_checks as never,
        raw_response: out as never,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);

    return { analysis: row, recommendations: out.recommendations };
  });

export const listAnalyses = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("aeo_analyses")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return { analyses: data ?? [] };
  });
