# Competitor Headline Analysis

A new authenticated module that takes a competitor domain URL, crawls recent article headlines, classifies them, and shows a dashboard with charts and tables.

## User flow

1. User goes to `/competitor` (new route in the authenticated sidebar).
2. Enters a domain URL (e.g. `https://www.thehindu.com`) and clicks **Analyze**.
3. Backend crawls up to 500 recent headlines, classifies them, stores the report, and returns it.
4. Dashboard renders below the form. Past reports are listed and re-openable.

## Crawling strategy (up to 500 headlines)

To stay reliable across Indian news sites without per-site scrapers:

1. Fetch `/sitemap.xml` (and any sitemap-index children, news/article sitemaps prioritized).
2. Collect article URLs (filter by domain, dedupe, take most recent 500 via `<lastmod>` when present).
3. For each URL fetch the page (concurrency 8, timeout 8s, max 500). Extract headline from `og:title` → `<title>` → first `<h1>`.
4. If sitemap yields < 50 URLs, fall back to scraping `<a>` tags from the homepage + a couple of section pages and treat link text as the headline.
5. Cap total wall time at ~90s; return whatever was collected with a `headlines_collected` count.

## Classification

Rule-based (fast, free, deterministic, multilingual-safe for English headlines; we note that non-English headlines are bucketed as "other"):

- **Number**: starts with or contains `\b\d+\b` early (top 10, 5 ways, etc.)
- **Question**: ends with `?` or starts with who/what/why/how/when/where/is/are/can/should/do/does
- **How-To**: matches `^how to\b` or contains `guide to|tutorial|step by step`
- **Curiosity**: contains words like `secret|surprising|you won't believe|this is why|reason|truth|revealed|shocking|mystery`
- **Authority**: contains `study|research|expert|report|official|according to|data|analysis|survey|scientist`
- **Emotional**: contains a curated emotion lexicon (`amazing|heartbreaking|stunning|tragic|joy|fear|angry|love|hate|crisis|win|loss|hope|dream|nightmare|incredible|devastating` …)

A headline can match multiple categories; primary category is the first match in the order above for the "Top pattern" view, but per-category usage % counts all matches.

Additional metrics:
- **Length distribution**: bucketed by word count (≤5, 6–8, 9–11, 12–15, 16+).
- **Emotional trigger analysis**: top emotional words found, with counts.
- **Top patterns**: top 10 most common opening bigrams (e.g. "how to", "why the", "5 ways").

## Data model

New table `competitor_reports`:

- `id uuid pk`
- `publication_id uuid` (scoped via existing profiles publication)
- `created_by uuid`
- `domain text`
- `headlines_collected int`
- `category_counts jsonb` — `{number, question, how_to, curiosity, authority, emotional, other}`
- `length_buckets jsonb` — `{ "≤5": n, ... }`
- `top_patterns jsonb` — `[{pattern, count}]`
- `emotional_triggers jsonb` — `[{word, count}]`
- `sample_headlines jsonb` — array of `{title, url, categories[]}` (cap 100 to keep row small)
- `created_at timestamptz default now()`

RLS: select/insert scoped to the user's publication (mirrors `aeo_analyses` policies). Standard grants to `authenticated` + `service_role`.

## Backend (server functions)

New `src/lib/competitor.functions.ts`:

- `analyzeCompetitor({ domain })` — auth-protected. Crawls, classifies, inserts row, returns full report.
- `listCompetitorReports()` — returns recent reports for the user's publication.
- `getCompetitorReport({ id })` — single report.

All use `requireSupabaseAuth`. No external AI calls needed → cheap and fast.

## Frontend

New route `src/routes/_authenticated/competitor.tsx`:

- Form: domain input + Analyze button (uses `useMutation`).
- Saved reports list (left side / above on mobile) using `useQuery` on `listCompetitorReports`.
- Dashboard panel:
  - **Category usage %** — horizontal bar chart + table (recharts).
  - **Length distribution** — bar chart by word-count bucket.
  - **Top patterns** — table of opening bigrams with counts.
  - **Emotional triggers** — pill cloud + table of top words.
  - **Trend visualization** — line chart of category % across the user's previous reports for the same domain (so they can see how a competitor's style shifts over time).
  - **Sample headlines** — table with title, detected categories, link.

Charts use existing `recharts` (already used elsewhere) and shadcn `Card`, `Table`, `Tabs`, `Badge`.

Add a sidebar link "Competitor" in `src/routes/_authenticated.tsx` next to AEO.

## Out of scope (to keep this shippable)

- Per-site custom scrapers; we rely on sitemaps + og:title.
- Non-English headline classification beyond bucketing into "other".
- Scheduled re-crawls (user re-runs manually).