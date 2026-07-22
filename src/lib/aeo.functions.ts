import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
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
  overall_score: z.coerce.number().int().min(0).max(100),
  position_zero_summary: z.string(),
  faqs: z.array(z.object({ question: z.string(), answer: z.string() })).min(3).max(4),
  headlines: z.object({
    discover: z.string(),
    seo: z.string(),
    social: z.string(),
  }),
  discover_ready: z.coerce.boolean(),
  discover_checks: z.preprocess(
    (value) => Array.isArray(value)
      ? value.map((item, index) => {
          if (typeof item === "string") return { label: item, pass: false };
          if (!item || typeof item !== "object") return { label: `Check ${index + 1}`, pass: false };
          const row = item as Record<string, unknown>;
          return {
            label: String(row.label ?? row.check ?? row.name ?? row.title ?? row.item ?? `Check ${index + 1}`),
            pass: typeof row.pass === "boolean"
              ? row.pass
              : typeof row.passed === "boolean"
                ? row.passed
                : String(row.status ?? row.result ?? "").toLowerCase().includes("pass"),
            note: row.note ?? row.reason ?? row.recommendation ?? row.description ? String(row.note ?? row.reason ?? row.recommendation ?? row.description) : undefined,
          };
        })
      : value,
    z.array(z.object({ label: z.string(), pass: z.boolean(), note: z.string().optional() })),
  ),
  recommendations: z.preprocess(
    (value) => Array.isArray(value)
      ? value.map((item) => {
          if (typeof item === "string") return item;
          if (!item || typeof item !== "object") return String(item ?? "");
          const row = item as Record<string, unknown>;
          return String(row.recommendation ?? row.action ?? row.title ?? row.text ?? row.rationale ?? JSON.stringify(row));
        })
      : value,
    z.array(z.string()).min(3).max(8),
  ),
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

function extractJsonObject(text: string): unknown {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/```$/i, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) throw new Error("Gemini returned invalid JSON");
  return JSON.parse(cleaned.slice(start, end + 1));
}

async function generateGeminiJson(apiKey: string, prompt: string): Promise<unknown> {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    }),
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) {
    const details = await res.text().catch(() => "");
    throw new Error(`Gemini API error ${res.status}${details ? `: ${details.slice(0, 300)}` : ""}`);
  }
  const json = await res.json();
  const content = json?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("") ?? "";
  if (!content) throw new Error("Gemini returned an empty response");
  return extractJsonObject(content);
}
async function fetchArticleText(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "TestKaroBot/1.0 (+https://testkaro.in)" },
      signal: AbortSignal.timeout(8000),
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
      .select("publication_id, plan_tier, trial_end_date, plan_end_date, account_blocked, api_calls_this_month, api_calls_all_time, selected_languages")
      .eq("user_id", userId)
      .maybeSingle();
    if (!profile?.publication_id) throw new Error("Create a publication first");

    const { data: adminRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    const isAdmin = !!adminRole;

    // Usage limit enforcement does not apply to admins.
    const tier = profile.plan_tier ?? "trial";
    if (!isAdmin) {
      if (profile.account_blocked) {
        throw new Error("LIMIT:BLOCKED:Your account has been suspended. Contact support.");
      }
      if (tier === "free" && (profile.api_calls_all_time ?? 0) >= 3) {
        throw new Error("LIMIT:FREE:You've used your 3 free headline sets. Upgrade to keep going.");
      }
      if (tier === "trial" && profile.trial_end_date && new Date(profile.trial_end_date) < new Date()) {
        throw new Error("LIMIT:TRIAL:Your free trial has ended. Please contact admin to activate your plan.");
      }
      if (["starter", "growth", "enterprise"].includes(tier) && profile.plan_end_date && new Date(profile.plan_end_date) < new Date()) {
        throw new Error(`LIMIT:${tier.toUpperCase()}:Your ${tier} plan has ended. Please contact admin to activate your plan.`);
      }
    }
    const selectedLanguages = profile.selected_languages as Lang[] | null;
    if (selectedLanguages?.length && !selectedLanguages.includes(data.language)) {
      throw new Error("Selected language is not enabled for your account. Please contact admin.");
    }
    if (!isAdmin) {
      if (tier === "starter" && (profile.api_calls_this_month ?? 0) >= 50) {
        throw new Error("LIMIT:STARTER:You've used all 50 headline sets this month. Upgrade to Growth for 200/month.");
      }
      if (tier === "growth" && (profile.api_calls_this_month ?? 0) >= 200) {
        throw new Error("LIMIT:GROWTH:You've reached your 200/month limit. Upgrade to Enterprise for unlimited.");
      }
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("Gemini API key not configured");

    const articleText = await fetchArticleText(data.article_url);

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
- faqs: exactly 3-4 Q&A pairs in ${langName} that an answer engine would surface
- headlines: an object with THREE headlines in ${langName} (native script), each 60-90 chars, truthful, no clickbait:
    - discover: optimized for Google Discover (emotional hook, curiosity, entity-rich)
    - seo: optimized for Google Search (front-load primary keyword, clear intent)
    - social: optimized for social media / WhatsApp shares (punchy, conversational, share-worthy)
- discover_ready: boolean
- discover_checks: 5-7 specific checks (e.g., "E-E-A-T author byline present", "High-quality 1200x800 image", "Headline under 90 chars") with pass/fail and a one-line note
- recommendations: 4-6 prioritized action items in ${langName}`;
    const out = AeoSchema.parse(await generateGeminiJson(apiKey, `${system}\n\n${prompt}\n\nReturn ONLY a valid JSON object. Do not include markdown.`));

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

    // Increment counters (best-effort)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).rpc("record_api_call", { _lang: data.language });

    return { analysis: row, recommendations: out.recommendations, headlines: out.headlines, faqs: out.faqs };
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
