import { useState } from "react";

const FAQS = [
  {
    q: "Where exactly does Story Pulse test headlines?",
    a: "On your homepage, your section pages, and inside 'Read More' / related-article modules — anywhere there's a link pointing to an article. That's where the click decision happens. We do NOT modify the article page itself.",
  },
  {
    q: "Does this affect my Google Search ranking?",
    a: "No. We don't touch the article's H1, <title>, meta description, og:title, canonical URL or JSON-LD. We only swap the anchor text of links on listing pages. Google sees one canonical article with one canonical headline.",
  },
  {
    q: "Does it create multiple H1 tags?",
    a: "No. The H1 on the article page is whatever your CMS published. Story Pulse only edits link text on pages that link to that article.",
  },
  {
    q: "How is this different from Chartbeat?",
    a: "Chartbeat is excellent at attention and reading depth analytics. Story Pulse is a focused headline A/B + AEO tool for Indian-language publishers, with native script rendering, section-level style insights, and Quality Clicks built in. They complement each other.",
  },
  {
    q: "What about AMP pages?",
    a: "Story Pulse doesn't run on AMP — we're honest about that. The benefit reaches AMP after the editor pushes the winning headline to the CMS, since AMP rebuilds from your source.",
  },
  {
    q: "Will readers notice the headline changing?",
    a: "No. Each anonymous visitor is consistently assigned one variant per test, so they see the same headline on every visit while the test runs.",
  },
  {
    q: "How does the algorithm work?",
    a: "Thompson Sampling — a multi-armed bandit. Traffic dynamically shifts toward the winning headline during the test, instead of waiting for a slow z-test. Same family of algorithms used by Chartbeat and Parse.ly.",
  },
  {
    q: "What is the AEO optimizer?",
    a: "Answer Engine Optimization. We analyze your article in its native language, generate a ≤45-word Position Zero summary, FAQ JSON-LD, NewsArticle schema, and a Google Discover readiness check. Built for ChatGPT, Perplexity, and Google AI Overviews.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="divide-y divide-border rounded-2xl border border-border bg-card">
      {FAQS.map((f, i) => {
        const isOpen = open === i;
        return (
          <div key={i}>
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-start justify-between gap-6 p-5 text-left transition hover:bg-muted/40"
            >
              <span className="font-display text-lg font-semibold text-foreground">
                {f.q}
              </span>
              <span
                className={`mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition ${
                  isOpen ? "rotate-45 border-primary text-primary" : ""
                }`}
              >
                +
              </span>
            </button>
            {isOpen && (
              <div className="px-5 pb-5 text-[15px] leading-relaxed text-muted-foreground">
                {f.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
