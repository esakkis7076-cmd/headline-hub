import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const UA = "TestKaroBot/1.0 (+https://testkaro.in)";
const FETCH_TIMEOUT_MS = 8000;
const CONCURRENCY = 8;
const MAX_HEADLINES = 500;
const TOTAL_TIME_MS = 85000;

type Category =
  | "number"
  | "question"
  | "how_to"
  | "curiosity"
  | "authority"
  | "emotional"
  | "other";

const CATEGORY_ORDER: Category[] = [
  "number",
  "question",
  "how_to",
  "curiosity",
  "authority",
  "emotional",
];

const CURIOSITY_RE = /\b(secret|surprising|you won['’]t believe|this is why|reason|truth|revealed|shocking|mystery|exposed|hidden|untold)\b/i;
const AUTHORITY_RE = /\b(study|research|expert|report|official|according to|data|analysis|survey|scientist|government|minister|court|ruling)\b/i;
const EMOTION_WORDS = [
  "amazing","heartbreaking","stunning","tragic","joy","fear","angry","love","hate",
  "crisis","win","loss","hope","dream","nightmare","incredible","devastating",
  "shock","shocked","outrage","triumph","disaster","horror","emotional","painful",
  "miracle","unbelievable","stunning","brutal","fury","grief","celebrates","mourns",
];
const EMOTION_RE = new RegExp(`\\b(${EMOTION_WORDS.join("|")})\\b`, "i");
const QUESTION_START_RE = /^(who|what|why|how|when|where|is|are|can|should|do|does|will|did|could|would)\b/i;
const HOWTO_RE = /(^how to\b|\bguide to\b|\btutorial\b|\bstep by step\b|\bhow you can\b)/i;
const NUMBER_RE = /\b\d{1,3}\b/;
const STOP = new Set(["the","a","an","of","to","in","on","for","and","is","are","with","by","at","this","that","from","as","or","be","it","its"]);

function classify(headline: string): Category[] {
  const h = headline.trim();
  const cats: Category[] = [];
  if (NUMBER_RE.test(h.split(/\s+/).slice(0, 6).join(" "))) cats.push("number");
  if (h.endsWith("?") || QUESTION_START_RE.test(h)) cats.push("question");
  if (HOWTO_RE.test(h)) cats.push("how_to");
  if (CURIOSITY_RE.test(h)) cats.push("curiosity");
  if (AUTHORITY_RE.test(h)) cats.push("authority");
  if (EMOTION_RE.test(h)) cats.push("emotional");
  if (cats.length === 0) cats.push("other");
  return cats;
}

function lengthBucket(words: number): string {
  if (words <= 5) return "≤5";
  if (words <= 8) return "6–8";
  if (words <= 11) return "9–11";
  if (words <= 15) return "12–15";
  return "16+";
}

function extractEmotionalWords(h: string): string[] {
  const found: string[] = [];
  const lower = h.toLowerCase();
  for (const w of EMOTION_WORDS) {
    if (new RegExp(`\\b${w}\\b`).test(lower)) found.push(w);
  }
  return found;
}

function openingBigram(h: string): string | null {
  const words = h
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
  // First non-stop bigram from the start
  for (let i = 0; i < Math.min(words.length - 1, 4); i++) {
    const a = words[i];
    const b = words[i + 1];
    if (STOP.has(a) && i === 0) continue;
    return `${a} ${b}`;
  }
  return words.length >= 2 ? `${words[0]} ${words[1]}` : null;
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

function normalizeDomain(input: string): { origin: string; host: string } {
  let s = input.trim();
  if (!/^https?:\/\//i.test(s)) s = "https://" + s;
  const u = new URL(s);
  return { origin: `${u.protocol}//${u.host}`, host: u.host.replace(/^www\./, "") };
}

function uniqueOrdered<T>(items: T[]): T[] {
  const seen = new Set<T>();
  const out: T[] = [];
  for (const x of items) if (!seen.has(x)) { seen.add(x); out.push(x); }
  return out;
}

// Parse <loc> / <lastmod> with simple regex (avoid dep on xml parser)
function parseSitemapLocs(xml: string): { loc: string; lastmod?: string }[] {
  const out: { loc: string; lastmod?: string }[] = [];
  const re = /<url>([\s\S]*?)<\/url>/gi;
  let m;
  while ((m = re.exec(xml))) {
    const block = m[1];
    const loc = /<loc>([^<]+)<\/loc>/i.exec(block)?.[1]?.trim();
    const lastmod = /<lastmod>([^<]+)<\/lastmod>/i.exec(block)?.[1]?.trim();
    if (loc) out.push({ loc, lastmod });
  }
  return out;
}

function parseSitemapIndex(xml: string): string[] {
  const out: string[] = [];
  const re = /<sitemap>([\s\S]*?)<\/sitemap>/gi;
  let m;
  while ((m = re.exec(xml))) {
    const loc = /<loc>([^<]+)<\/loc>/i.exec(m[1])?.[1]?.trim();
    if (loc) out.push(loc);
  }
  return out;
}

async function discoverArticleUrls(origin: string, host: string, deadline: number): Promise<string[]> {
  const candidates = [
    `${origin}/sitemap.xml`,
    `${origin}/sitemap_index.xml`,
    `${origin}/sitemap-index.xml`,
    `${origin}/news-sitemap.xml`,
  ];
  const collected: { loc: string; lastmod?: string }[] = [];
  const visited = new Set<string>();

  async function visit(url: string, depth: number) {
    if (Date.now() > deadline) return;
    if (visited.has(url) || depth > 2) return;
    visited.add(url);
    const xml = await timedFetch(url);
    if (!xml) return;
    if (/<sitemapindex/i.test(xml)) {
      const children = parseSitemapIndex(xml);
      // Prioritize news/article sitemaps
      children.sort((a, b) => Number(/news|article|post/i.test(b)) - Number(/news|article|post/i.test(a)));
      for (const c of children.slice(0, 8)) {
        if (collected.length >= MAX_HEADLINES * 2) break;
        await visit(c, depth + 1);
      }
    } else {
      collected.push(...parseSitemapLocs(xml));
    }
  }

  for (const c of candidates) {
    if (collected.length >= MAX_HEADLINES * 2) break;
    await visit(c, 0);
  }

  // Filter same-host article-ish URLs
  const filtered = collected.filter(({ loc }) => {
    try {
      const u = new URL(loc);
      if (u.host.replace(/^www\./, "") !== host) return false;
      const p = u.pathname;
      if (p === "/" || p.length < 8) return false;
      if (/\.(xml|jpg|jpeg|png|gif|webp|pdf)$/i.test(p)) return false;
      return true;
    } catch {
      return false;
    }
  });

  filtered.sort((a, b) => (b.lastmod ?? "").localeCompare(a.lastmod ?? ""));
  return uniqueOrdered(filtered.map((x) => x.loc)).slice(0, MAX_HEADLINES);
}

async function discoverFromHomepage(origin: string, host: string): Promise<{ url: string; anchor?: string }[]> {
  const html = await timedFetch(origin);
  if (!html) return [];
  const out: { url: string; anchor?: string }[] = [];
  const re = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(html))) {
    let href = m[1];
    try {
      const u = new URL(href, origin);
      if (u.host.replace(/^www\./, "") !== host) continue;
      if (u.pathname.length < 12) continue;
      if (/\.(jpg|jpeg|png|gif|webp|pdf|xml)$/i.test(u.pathname)) continue;
      const text = m[2].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      if (!text || text.length < 20) continue;
      out.push({ url: u.toString(), anchor: text });
    } catch { /* ignore */ }
  }
  // dedupe by url
  const seen = new Set<string>();
  return out.filter((x) => (seen.has(x.url) ? false : (seen.add(x.url), true)));
}

function extractHeadline(html: string): string | null {
  const og = /<meta\s+[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i.exec(html)
    ?? /<meta\s+[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i.exec(html);
  if (og) return decodeEntities(og[1]).trim();
  const tw = /<meta\s+[^>]*name=["']twitter:title["'][^>]*content=["']([^"']+)["']/i.exec(html);
  if (tw) return decodeEntities(tw[1]).trim();
  const title = /<title>([^<]+)<\/title>/i.exec(html);
  if (title) return decodeEntities(title[1]).trim();
  const h1 = /<h1[^>]*>([\s\S]*?)<\/h1>/i.exec(html);
  if (h1) return decodeEntities(h1[1].replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
  return null;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

async function fetchHeadlinesBatch(urls: string[], deadline: number): Promise<{ url: string; title: string }[]> {
  const results: { url: string; title: string }[] = [];
  let i = 0;
  async function worker() {
    while (i < urls.length && Date.now() < deadline && results.length < MAX_HEADLINES) {
      const idx = i++;
      const u = urls[idx];
      const html = await timedFetch(u, 6000);
      if (!html) continue;
      const t = extractHeadline(html);
      if (t && t.length >= 12) results.push({ url: u, title: t });
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));
  return results;
}

export const analyzeCompetitor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ domain: z.string().min(3).max(300) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: profile } = await supabase
      .from("profiles")
      .select("publication_id")
      .eq("user_id", userId)
      .maybeSingle();
    if (!profile?.publication_id) throw new Error("Create a publication first");

    let origin: string, host: string;
    try {
      ({ origin, host } = normalizeDomain(data.domain));
    } catch {
      throw new Error("Invalid domain");
    }

    const start = Date.now();
    const deadline = start + TOTAL_TIME_MS;

    // 1. Sitemap discovery
    let articleUrls = await discoverArticleUrls(origin, host, start + 25000);
    let headlines: { url: string; title: string }[] = [];

    if (articleUrls.length >= 30) {
      headlines = await fetchHeadlinesBatch(articleUrls.slice(0, MAX_HEADLINES), deadline);
    }

    // 2. Homepage fallback
    if (headlines.length < 50) {
      const home = await discoverFromHomepage(origin, host);
      // Use anchor text directly as the headline (no fetch needed)
      const anchorHeads = home
        .filter((x) => x.anchor && x.anchor.split(/\s+/).length >= 4)
        .map((x) => ({ url: x.url, title: x.anchor as string }));
      const seen = new Set(headlines.map((h) => h.url));
      for (const a of anchorHeads) {
        if (headlines.length >= MAX_HEADLINES) break;
        if (!seen.has(a.url)) { headlines.push(a); seen.add(a.url); }
      }
    }

    if (headlines.length === 0) {
      throw new Error(`No headlines could be collected from ${host}. The site may block crawlers or have no sitemap.`);
    }

    // Classify + aggregate
    const categoryCounts: Record<Category, number> = {
      number: 0, question: 0, how_to: 0, curiosity: 0, authority: 0, emotional: 0, other: 0,
    };
    const lengthBuckets: Record<string, number> = { "≤5": 0, "6–8": 0, "9–11": 0, "12–15": 0, "16+": 0 };
    const bigramCounts = new Map<string, number>();
    const emoCounts = new Map<string, number>();
    const sample: { title: string; url: string; categories: Category[] }[] = [];

    for (const h of headlines) {
      const cats = classify(h.title);
      for (const c of cats) categoryCounts[c]++;
      const wc = h.title.split(/\s+/).filter(Boolean).length;
      lengthBuckets[lengthBucket(wc)]++;
      const bg = openingBigram(h.title);
      if (bg) bigramCounts.set(bg, (bigramCounts.get(bg) ?? 0) + 1);
      for (const w of extractEmotionalWords(h.title)) emoCounts.set(w, (emoCounts.get(w) ?? 0) + 1);
      if (sample.length < 100) sample.push({ title: h.title, url: h.url, categories: cats });
    }

    const topPatterns = [...bigramCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([pattern, count]) => ({ pattern, count }));
    const emotionalTriggers = [...emoCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([word, count]) => ({ word, count }));

    const { data: row, error } = await supabase
      .from("competitor_reports")
      .insert({
        publication_id: profile.publication_id,
        created_by: userId,
        domain: host,
        headlines_collected: headlines.length,
        category_counts: categoryCounts as never,
        length_buckets: lengthBuckets as never,
        top_patterns: topPatterns as never,
        emotional_triggers: emotionalTriggers as never,
        sample_headlines: sample as never,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { report: row };
  });

export const listCompetitorReports = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("competitor_reports")
      .select("id, domain, headlines_collected, category_counts, created_at")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return { reports: data ?? [] };
  });

export const getCompetitorReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("competitor_reports")
      .select("*")
      .eq("id", data.id)
      .single();
    if (error) throw new Error(error.message);
    return { report: row };
  });

export const getDomainTrend = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ domain: z.string().min(1).max(300) }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("competitor_reports")
      .select("id, created_at, category_counts, headlines_collected")
      .eq("domain", data.domain)
      .order("created_at", { ascending: true })
      .limit(50);
    if (error) throw new Error(error.message);
    return { trend: rows ?? [] };
  });
