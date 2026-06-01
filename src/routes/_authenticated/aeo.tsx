import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { analyzeArticle, listAnalyses } from "@/lib/aeo.functions";
import { Sparkles, Copy, Check } from "lucide-react";

export const Route = createFileRoute("/_authenticated/aeo")({
  component: AeoPage,
  head: () => ({ meta: [{ title: "AEO analyzer — TestKaro" }] }),
});

type Lang = "hi" | "bn" | "ta" | "te" | "mr" | "gu" | "kn" | "ml" | "pa" | "en";

function AeoPage() {
  const analyze = useServerFn(analyzeArticle);
  const list = useServerFn(listAnalyses);
  const qc = useQueryClient();
  const [url, setUrl] = useState("");
  const [lang, setLang] = useState<Lang>("hi");
  const [recs, setRecs] = useState<string[] | null>(null);
  const [headlines, setHeadlines] = useState<{ discover: string; seo: string; social: string } | null>(null);
  const [faqs, setFaqs] = useState<{ question: string; answer: string }[] | null>(null);

  const history = useQuery({ queryKey: ["aeo"], queryFn: () => list() });

  const mut = useMutation({
    mutationFn: (data: { article_url: string; language: Lang }) => analyze({ data }),
    onSuccess: (res) => {
      toast.success("Analysis complete");
      setRecs(res.recommendations);
      setHeadlines(res.headlines);
      setFaqs(res.faqs);
      qc.invalidateQueries({ queryKey: ["aeo"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const latest = mut.data?.analysis ?? history.data?.analyses[0];

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="font-serif text-3xl font-semibold tracking-tight">AEO Analyzer</h1>
      <p className="text-muted-foreground mt-1 text-sm">Optimize articles for Google Discover, AI Overviews, ChatGPT, and Perplexity — in your native language.</p>

      <form
        onSubmit={(e) => { e.preventDefault(); mut.mutate({ article_url: url, language: lang }); }}
        className="mt-6 rounded-2xl border border-border/60 bg-card/30 p-5 flex flex-col sm:flex-row gap-3"
      >
        <input required type="url" placeholder="https://yourpub.in/article" value={url} onChange={(e) => setUrl(e.target.value)} className="flex-1 rounded-lg border border-border bg-background px-3 py-2.5 text-sm" />
        <select value={lang} onChange={(e) => setLang(e.target.value as Lang)} className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm">
          <option value="hi">Hindi</option>
          <option value="bn">Bengali</option>
          <option value="ta">Tamil</option>
          <option value="te">Telugu</option>
          <option value="mr">Marathi</option>
          <option value="gu">Gujarati</option>
          <option value="kn">Kannada</option>
          <option value="ml">Malayalam</option>
          <option value="pa">Punjabi</option>
          <option value="en">English</option>
        </select>
        <button type="submit" disabled={mut.isPending} className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
          <Sparkles size={14} />
          {mut.isPending ? "Analyzing…" : "Analyze"}
        </button>
      </form>

      {latest && (
        <div className="mt-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-border/60 bg-card/30 p-6 text-center">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Overall AEO score</div>
              <div className="mt-2 text-5xl font-semibold tabular-nums text-primary">{latest.overall_score}</div>
              <div className="text-xs text-muted-foreground">out of 100</div>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card/30 p-6 md:col-span-2">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Position-Zero summary</div>
              <p className="text-base leading-relaxed">{latest.position_zero_summary}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card/30 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Google Discover readiness</h2>
              <span className={`text-xs rounded-full px-2 py-0.5 ${latest.discover_ready ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"}`}>
                {latest.discover_ready ? "Ready" : "Needs work"}
              </span>
            </div>
            <ul className="space-y-2">
              {(latest.discover_checks as { label: string; pass: boolean; note?: string }[] ?? []).map((c, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span className={`mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full ${c.pass ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>
                    {c.pass ? "✓" : "!"}
                  </span>
                  <div>
                    <div className="font-medium">{c.label}</div>
                    {c.note && <div className="text-xs text-muted-foreground">{c.note}</div>}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {headlines && (
            <div className="rounded-2xl border border-border/60 bg-card/30 p-6">
              <h2 className="font-semibold mb-4">Suggested headlines</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {([
                  { key: "discover", label: "Google Discover", tint: "text-rose-400" },
                  { key: "seo", label: "Search SEO", tint: "text-sky-400" },
                  { key: "social", label: "Social / WhatsApp", tint: "text-emerald-400" },
                ] as const).map((h) => (
                  <HeadlineCard key={h.key} label={h.label} tint={h.tint} text={headlines[h.key]} />
                ))}
              </div>
            </div>
          )}

          {faqs && faqs.length > 0 && (
            <div className="rounded-2xl border border-border/60 bg-card/30 p-6">
              <h2 className="font-semibold mb-3">FAQs ({faqs.length})</h2>
              <ul className="space-y-4">
                {faqs.map((f, i) => (
                  <li key={i}>
                    <div className="font-medium text-sm">{f.question}</div>
                    <div className="text-sm text-muted-foreground mt-1">{f.answer}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}


          {recs && recs.length > 0 && (
            <div className="rounded-2xl border border-border/60 bg-card/30 p-6">
              <h2 className="font-semibold mb-3">Recommendations</h2>
              <ol className="space-y-2 list-decimal list-inside text-sm">
                {recs.map((r, i) => <li key={i}>{r}</li>)}
              </ol>
            </div>
          )}

          <SchemaBlock schema={latest.faq_schema} />
        </div>
      )}

      {!latest && history.data && history.data.analyses.length > 0 && (
        <div className="mt-10">
          <h2 className="font-semibold mb-3">Recent analyses</h2>
          <div className="space-y-2">
            {history.data.analyses.slice(0, 10).map((a) => (
              <div key={a.id} className="rounded-xl border border-border/60 bg-card/30 p-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-sm truncate">{a.article_url}</div>
                  <div className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString()} · {a.language}</div>
                </div>
                <div className="text-2xl font-semibold tabular-nums text-primary">{a.overall_score}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SchemaBlock({ schema }: { schema: unknown }) {
  const [copied, setCopied] = useState(false);
  const json = JSON.stringify(schema, null, 2);
  const copy = async () => {
    await navigator.clipboard.writeText(`<script type="application/ld+json">\n${json}\n</script>`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="rounded-2xl border border-border/60 bg-card/30 p-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold">FAQ JSON-LD schema</h2>
        <button onClick={copy} className="inline-flex items-center gap-1 rounded-md bg-muted px-2.5 py-1 text-xs hover:bg-accent">
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-auto rounded-lg bg-background/60 p-4 text-xs leading-relaxed max-h-80"><code>{json}</code></pre>
      <p className="mt-2 text-xs text-muted-foreground">Paste into your CMS template inside a &lt;script type="application/ld+json"&gt; tag.</p>
    </div>
  );
}
