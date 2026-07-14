import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const UA = "TestKaroBot/1.0 (+https://testkaro.in)";
const FETCH_TIMEOUT_MS = 6000;
const TOTAL_TIME_MS = 22000;
const MAX_URLS_PER_DOMAIN = 250;
const MAX_SITEMAP_CHILDREN = 3;

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

// ───────────────────────────── shared helpers ─────────────────────────────

function normalizeDomain(input: string): { origin: string; host: string } {
  let s = input.trim();
  if (!/^https?:\/\//i.test(s)) s = "https://" + s;
  const u = new URL(s);
  return { origin: `${u.protocol}//${u.host}`, host: u.host.replace(/^www\./, "") };
}

async function timedFetch(url: string, timeout = FETCH_TIMEOUT_MS): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8" },
      signal: AbortSignal.timeout(timeout),
      redirect: "follow",
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

function parseLocs(xml: string): string[] {
  const out: string[] = [];
  const re = /<loc>([^<]+)<\/loc>/gi;
  let m;
  while ((m = re.exec(xml))) out.push(m[1].trim());
  return out;
}

async function sitemapsFromRobots(origin: string): Promise<string[]> {
  const txt = await timedFetch(`${origin}/robots.txt`, 4000);
  if (!txt) return [];
  const out: string[] = [];
  for (const line of txt.split(/\r?\n/)) {
    const m = line.match(/^\s*sitemap\s*:\s*(\S+)/i);
    if (m) out.push(m[1].trim());
  }
  return out;
}

async function discoverArticleUrls(origin: string, host: string, deadline: number): Promise<string[]> {
  const fromRobots = await sitemapsFromRobots(origin);
  const candidates = [
    ...fromRobots,
    `${origin}/sitemap.xml`,
    `${origin}/sitemap_index.xml`,
    `${origin}/sitemap-index.xml`,
    `${origin}/sitemap/sitemap-index.xml`,
    `${origin}/news-sitemap.xml`,
    `${origin}/sitemap/googlenews/all/all.xml`,
    `${origin}/sitemap/update/all.xml`,
    `${origin}/arc/outboundfeeds/sitemap/`,
  ];
  // de-dupe while preserving order
  const seenCand = new Set<string>();
  const uniqueCandidates = candidates.filter((c) => (seenCand.has(c) ? false : (seenCand.add(c), true)));

  const collected = new Set<string>();
  const visited = new Set<string>();

  async function visit(url: string, depth: number) {
    if (Date.now() > deadline) return;
    if (visited.has(url) || depth > 2) return;
    visited.add(url);
    const xml = await timedFetch(url);
    if (!xml) return;
    if (/<sitemapindex/i.test(xml)) {
      const children = parseLocs(xml);
      children.sort((a, b) => Number(/news|article|post|recent/i.test(b)) - Number(/news|article|post|recent/i.test(a)));
      for (const c of children.slice(0, MAX_SITEMAP_CHILDREN)) {
        if (collected.size >= MAX_URLS_PER_DOMAIN * 2) break;
        if (Date.now() > deadline) break;
        await visit(c, depth + 1);
      }
    } else {
      for (const loc of parseLocs(xml)) collected.add(loc);
    }
  }

  for (const c of uniqueCandidates) {
    if (collected.size >= MAX_URLS_PER_DOMAIN) break;
    if (Date.now() > deadline) break;
    await visit(c, 0);
  }

  const filtered: string[] = [];
  for (const loc of collected) {
    try {
      const u = new URL(loc);
      if (u.host.replace(/^www\./, "") !== host) continue;
      const p = u.pathname;
      if (p === "/" || p.length < 8) continue;
      if (/\.(xml|jpg|jpeg|png|gif|webp|pdf)$/i.test(p)) continue;
      filtered.push(loc);
    } catch { /* ignore */ }
  }
  return filtered.slice(0, MAX_URLS_PER_DOMAIN);
}

// ───────────────────────────── topic extraction ─────────────────────────────

const STOP = new Set([
  "the","a","an","and","or","of","to","in","on","for","with","by","at","from","is","are","was","were","be","been",
  "this","that","these","those","it","its","as","but","not","no","yes","you","your","we","our","they","their",
  "he","she","his","her","him","them","i","me","my","mine","us","ours","do","does","did","done","have","has","had",
  "will","would","can","could","should","may","might","must","shall","up","down","out","over","into","than","then",
  "so","if","while","also","very","just","more","most","such","new","news","latest","best","top","one","two","get",
  "live","video","photos","photo","update","updates","report","reports","day","week","month","year","amp","html",
  "vs","via","says","said","ndtv","com","www","html","amp","says","day1","2024","2025","2026",
]);

function tokensFromUrl(u: string): string[] {
  try {
    const url = new URL(u);
    const slug = decodeURIComponent(url.pathname)
      .toLowerCase()
      .replace(/\.(html?|php|aspx?)$/, "")
      .replace(/[\/_\-.]+/g, " ")
      .replace(/[^a-z0-9\s]/g, " ");
    return slug
      .split(/\s+/)
      .filter((w) => w.length >= 4 && !STOP.has(w) && !/^\d+$/.test(w));
  } catch {
    return [];
  }
}

type TopicEntry = { topic: string; count: number };

function extractTopics(urls: string[], topN = 60): TopicEntry[] {
  const counts = new Map<string, number>();
  for (const u of urls) {
    const toks = tokensFromUrl(u);
    const seen = new Set<string>();
    // unigrams
    for (const t of toks) {
      if (seen.has(t)) continue;
      seen.add(t);
      counts.set(t, (counts.get(t) ?? 0) + 1);
    }
    // bigrams
    for (let i = 0; i < toks.length - 1; i++) {
      const bg = `${toks[i]} ${toks[i + 1]}`;
      if (seen.has(bg)) continue;
      seen.add(bg);
      counts.set(bg, (counts.get(bg) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .filter(([, c]) => c >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([topic, count]) => ({ topic, count }));
}

// ───────────────────────────── recommendation via Gemini AI ─────────────────────────────

async function generateRecommendations(args: {
  userDomain: string;
  competitorDomain: string;
  missing: TopicEntry[];
  underCovered: { topic: string; user_count: number; competitor_count: number }[];
}): Promise<{ recommendations: Recommendation[]; summary: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      summary: `${args.competitorDomain} covers ${args.missing.length} topic clusters that ${args.userDomain} is not publishing on. Focus on the highest-frequency missing topics first.`,
      recommendations: args.missing.slice(0, 10).map((t) => ({
        topic: t.topic,
        opportunity_score: Math.min(100, t.count * 5),
        suggested_article_ideas: [`Explainer: ${t.topic}`, `Listicle: top angles on ${t.topic}`],
        estimated_impact: "medium",
        rationale: `Competitor has ${t.count} articles on "${t.topic}". You have none.`,
      })),
    };
  }

  const prompt = `You are an SEO/content strategy analyst. The user's site (${args.userDomain}) is competing with ${args.competitorDomain}.

MISSING TOPICS (competitor publishes on, user does not):
${args.missing.slice(0, 25).map((t) => `- ${t.topic} (${t.count} articles)`).join("\n")}

UNDER-COVERED TOPICS (both cover, user lags):
${args.underCovered.slice(0, 15).map((t) => `- ${t.topic} — user: ${t.user_count}, competitor: ${t.competitor_count}`).join("\n")}

For the top 10 most strategic topics from the above, return JSON only matching this exact schema:
{
  "summary": "2-3 sentence overview of the content gap",
  "recommendations": [
    {
      "topic": "string",
      "opportunity_score": 0-100,
      "estimated_impact": "low" | "medium" | "high",
      "suggested_article_ideas": ["string", "string", "string"],
      "rationale": "1-2 sentences why this matters"
    }
  ]
}
Respond with ONLY the JSON object. No markdown, no prose.`;

  try {
    const parsed = await generateGeminiJson(apiKey, `${prompt}\n\nReturn ONLY a valid JSON object. Do not include markdown.`) as { summary?: unknown; recommendations?: unknown };
    return {
      summary: String(parsed.summary ?? ""),
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations.slice(0, 12) as Recommendation[] : [],
    };
  } catch (e) {
    return {
      summary: `Detected ${args.missing.length} missing topics and ${args.underCovered.length} under-covered topics. (AI summary unavailable: ${(e as Error).message})`,
      recommendations: args.missing.slice(0, 10).map((t) => ({
        topic: t.topic,
        opportunity_score: Math.min(100, t.count * 5),
        suggested_article_ideas: [`Explainer: ${t.topic}`],
        estimated_impact: "medium",
        rationale: `Competitor has ${t.count} articles on this; you have none.`,
      })),
    };
  }
}

type Recommendation = {
  topic: string;
  opportunity_score: number;
  estimated_impact: "low" | "medium" | "high";
  suggested_article_ideas: string[];
  rationale: string;
};

// ───────────────────────────── server functions ─────────────────────────────

export const analyzeContentGap = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      user_domain: z.string().min(3).max(300),
      competitor_domain: z.string().min(3).max(300),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: profile } = await supabase
      .from("profiles")
      .select("publication_id")
      .eq("user_id", userId)
      .maybeSingle();
    if (!profile?.publication_id) throw new Error("Create a publication first");

    let u, c;
    try { u = normalizeDomain(data.user_domain); } catch { throw new Error("Invalid user domain"); }
    try { c = normalizeDomain(data.competitor_domain); } catch { throw new Error("Invalid competitor domain"); }
    if (u.host === c.host) throw new Error("User and competitor domains must differ");

    const start = Date.now();
    const fullDeadline = start + TOTAL_TIME_MS;

    console.log(`[content-gap] crawling ${u.host} and ${c.host}`);
    const [userUrls, competitorUrls] = await Promise.all([
      discoverArticleUrls(u.origin, u.host, fullDeadline),
      discoverArticleUrls(c.origin, c.host, fullDeadline),
    ]);
    console.log(`[content-gap] discovered ${userUrls.length} / ${competitorUrls.length} URLs in ${Date.now() - start}ms`);

    if (competitorUrls.length === 0) {
      throw new Error(`No URLs discovered for competitor ${c.host}. Sitemap may be missing or blocked.`);
    }

    const userTopics = extractTopics(userUrls);
    const competitorTopics = extractTopics(competitorUrls);

    const userMap = new Map(userTopics.map((t) => [t.topic, t.count]));

    const missing: TopicEntry[] = competitorTopics
      .filter((t) => !userMap.has(t.topic) && t.count >= 3)
      .slice(0, 40);

    const underCovered = competitorTopics
      .filter((t) => {
        const uc = userMap.get(t.topic) ?? 0;
        return uc > 0 && t.count >= uc * 2 && t.count >= 4;
      })
      .map((t) => ({ topic: t.topic, user_count: userMap.get(t.topic) ?? 0, competitor_count: t.count }))
      .slice(0, 25);

    const { recommendations, summary } = await generateRecommendations({
      userDomain: u.host,
      competitorDomain: c.host,
      missing,
      underCovered,
    });

    const { data: row, error } = await supabase
      .from("content_gap_reports")
      .insert({
        publication_id: profile.publication_id,
        created_by: userId,
        user_domain: u.host,
        competitor_domain: c.host,
        user_url_count: userUrls.length,
        competitor_url_count: competitorUrls.length,
        user_topics: userTopics as never,
        competitor_topics: competitorTopics as never,
        missing_topics: missing as never,
        under_covered_topics: underCovered as never,
        recommendations: recommendations as never,
        summary,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { report: row };
  });

export const listContentGapReports = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("content_gap_reports")
      .select("id, user_domain, competitor_domain, user_url_count, competitor_url_count, created_at")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return { reports: data ?? [] };
  });

export const getContentGapReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("content_gap_reports")
      .select("*")
      .eq("id", data.id)
      .single();
    if (error) throw new Error(error.message);
    return { report: row };
  });
