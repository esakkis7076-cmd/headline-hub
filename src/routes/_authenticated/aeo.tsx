import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { analyzeArticle, listAnalyses } from "@/lib/aeo.functions";
import { getMyWorkspace } from "@/lib/workspace.functions";
import { checkIsAdmin } from "@/lib/admin.functions";
import { Sparkles, Copy, Check, RefreshCw, ChevronDown } from "lucide-react";

export const Route = createFileRoute("/_authenticated/aeo")({
  component: AeoPage,
  head: () => ({ meta: [{ title: "AEO analyzer — Story Pulse" }] }),
});

type Lang = "hi" | "bn" | "ta" | "te" | "mr" | "gu" | "kn" | "ml" | "pa" | "en";

const ADMIN_WHATSAPP_NUMBER = import.meta.env.VITE_ADMIN_WHATSAPP_NUMBER ?? "916380992671";
const TRIAL_ENDED_MESSAGE = "Your free trial has ended. Please contact admin to activate your plan.";

type PlanTier = "free" | "trial" | "starter" | "growth" | "enterprise";

function getPlanEndedMessage(plan: PlanTier | string | null | undefined) {
  if (plan === "starter" || plan === "growth" || plan === "enterprise") {
    return `Your ${plan} plan has ended. Please contact admin to activate your plan.`;
  }
  return TRIAL_ENDED_MESSAGE;
}

function getAdminWhatsappUrl(message = TRIAL_ENDED_MESSAGE) {
  const whatsappText = encodeURIComponent(`Hi admin, ${message} Please activate my Story Pulse plan.`);
  return `https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${whatsappText}`;
}

function parseLimit(msg: string): { kind: string; text: string } | null {
  if (!msg.startsWith("LIMIT:")) return null;
  const [, kind, ...rest] = msg.split(":");
  return { kind, text: rest.join(":").trim() };
}

function AeoPage() {
  const analyze = useServerFn(analyzeArticle);
  const list = useServerFn(listAnalyses);
  const getWs = useServerFn(getMyWorkspace);
  const qc = useQueryClient();
  const checkAdmin = useServerFn(checkIsAdmin);
  const [url, setUrl] = useState("");
  const [lang, setLang] = useState<Lang>("hi");
  const [recs, setRecs] = useState<string[] | null>(null);
  const [headlines, setHeadlines] = useState<{ discover: string; seo: string; social: string } | null>(null);
  const [faqs, setFaqs] = useState<{ question: string; answer: string }[] | null>(null);
  const [limit, setLimit] = useState<{ kind: string; text: string } | null>(null);

  const history = useQuery({ queryKey: ["aeo"], queryFn: () => list() });
  const workspace = useQuery({ queryKey: ["workspace"], queryFn: () => getWs() });
  const adminQ = useQuery({ queryKey: ["is-admin"], queryFn: () => checkAdmin() });

  // Filter languages based on user's selection
  const availableLanguages = useMemo(() => {
    const selectedLangs = workspace.data?.profile?.selected_languages;
    if (!selectedLangs || selectedLangs.length === 0) {
      // Fallback: show all languages for existing users
      return ["hi", "bn", "ta", "te", "mr", "gu", "kn", "ml", "pa", "en"] as Lang[];
    }
    return selectedLangs as Lang[];
  }, [workspace.data?.profile?.selected_languages]);

  // Set default language to first available if current is not in available
  useEffect(() => {
    if (availableLanguages.length > 0 && !availableLanguages.includes(lang)) {
      setLang(availableLanguages[0]);
    }
  }, [availableLanguages, lang]);

  const mut = useMutation({
    mutationFn: (data: { article_url: string; language: Lang }) => analyze({ data }),
    onSuccess: (res) => {
      toast.success("Analysis complete");
      setRecs(res.recommendations);
      setHeadlines(res.headlines);
      setFaqs(res.faqs);
      qc.invalidateQueries({ queryKey: ["aeo"] });
    },
    onError: (e: Error) => {
      const parsed = parseLimit(e.message);
      if (parsed) setLimit(parsed);
      else toast.error(e.message);
    },
  });

  const regenerate = (u: string, l: string) => {
    setUrl(u);
    setLang(l as Lang);
    mut.mutate({ article_url: u, language: l as Lang });
  };

  const latest = mut.data?.analysis ?? history.data?.analyses[0];
  const profile = workspace.data?.profile;
  const isAdmin = adminQ.data?.isAdmin === true;
  const shouldCheckPlan = adminQ.isError || (adminQ.isSuccess && !isAdmin);
  const expiredMessage = shouldCheckPlan && profile?.plan_tier === "trial" && profile.trial_end_date && new Date(profile.trial_end_date) < new Date()
    ? getPlanEndedMessage("trial")
    : shouldCheckPlan && (profile?.plan_tier === "starter" || profile?.plan_tier === "growth" || profile?.plan_tier === "enterprise") &&
      profile.plan_end_date &&
      new Date(profile.plan_end_date) < new Date()
      ? getPlanEndedMessage(profile.plan_tier)
      : null;

  if (expiredMessage) {
    return <PlanExpiredState message={expiredMessage} />;
  }

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
          {availableLanguages.map((l) => (
            <option key={l} value={l}>
              {l === "hi" ? "Hindi" : l === "bn" ? "Bengali" : l === "ta" ? "Tamil" : l === "te" ? "Telugu" : l === "mr" ? "Marathi" : l === "gu" ? "Gujarati" : l === "kn" ? "Kannada" : l === "ml" ? "Malayalam" : l === "pa" ? "Punjabi" : "English"}
            </option>
          ))}
        </select>
        <button type="submit" disabled={mut.isPending} className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
          <Sparkles size={14} />
          {mut.isPending ? "Analyzing…" : "Analyze"}
        </button>
      </form>

      
      {mut.isPending && (
        <div className="mt-3 rounded-lg border border-border/60 bg-card/40 px-4 py-3 text-sm text-muted-foreground">
          Analyzing article... this can take up to 30 seconds.
        </div>
      )}

      {mut.isError && !limit && (
        <div role="alert" className="mt-3 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {mut.error instanceof Error ? mut.error.message : "Analysis failed. Please try again."}
        </div>
      )}

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

      {history.data && history.data.analyses.length > 0 && (
        <div className="mt-10">
          <h2 className="font-semibold mb-3">Recent generations</h2>
          <div className="space-y-2">
            {history.data.analyses.slice(0, 20).map((a) => (
              <RecentRow key={a.id} a={a} onRegenerate={regenerate} disabled={mut.isPending} />
            ))}
          </div>
        </div>
      )}

      {limit && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-4">
          <div className="max-w-md w-full rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <h3 className="text-lg font-semibold">
              {limit.kind === "BLOCKED" ? "Account suspended" : "Upgrade required"}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">{limit.text}</p>
            <div className="mt-5 flex gap-2">
              {limit.kind === "TRIAL" || limit.kind === "STARTER" || limit.kind === "GROWTH" || limit.kind === "ENTERPRISE" ? (
                <a
                  href={getAdminWhatsappUrl(limit.text)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 text-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  Contact Admin on WhatsApp
                </a>
              ) : limit.kind !== "BLOCKED" && (
                <Link
                  to="/pricing"
                  onClick={() => setLimit(null)}
                  className="flex-1 text-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  See plans
                </Link>
              )}
              <button
                onClick={() => setLimit(null)}
                className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold hover:bg-accent"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RecentRow({
  a,
  onRegenerate,
  disabled,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  a: any;
  onRegenerate: (url: string, lang: string) => void;
  disabled: boolean;
}) {
  const [open, setOpen] = useState(false);
  const hl = (a.raw_response?.headlines ?? {}) as { discover?: string; seo?: string; social?: string };
  return (
    <div className="rounded-xl border border-border/60 bg-card/30 p-4">
      <div className="flex items-center justify-between gap-4">
        <button onClick={() => setOpen((o) => !o)} className="flex-1 min-w-0 text-left">
          <div className="text-sm truncate flex items-center gap-2">
            <ChevronDown size={14} className={`transition ${open ? "rotate-180" : ""}`} />
            {a.article_url}
          </div>
          <div className="text-xs text-muted-foreground ml-5">
            {new Date(a.created_at).toLocaleString()} · {a.language}
          </div>
        </button>
        <div className="flex items-center gap-3">
          <div className="text-2xl font-semibold tabular-nums text-primary">{a.overall_score}</div>
          <button
            onClick={() => onRegenerate(a.article_url, a.language)}
            disabled={disabled}
            className="inline-flex items-center gap-1 rounded-md bg-muted px-2.5 py-1.5 text-xs hover:bg-accent disabled:opacity-50"
          >
            <RefreshCw size={12} /> Regenerate
          </button>
        </div>
      </div>
      {open && (hl.discover || hl.seo || hl.social) && (
        <div className="mt-3 ml-5 grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
          {hl.discover && <div className="rounded bg-background/60 p-2"><b className="text-rose-400">Discover</b><div className="mt-1">{hl.discover}</div></div>}
          {hl.seo && <div className="rounded bg-background/60 p-2"><b className="text-sky-400">SEO</b><div className="mt-1">{hl.seo}</div></div>}
          {hl.social && <div className="rounded bg-background/60 p-2"><b className="text-emerald-400">Social</b><div className="mt-1">{hl.social}</div></div>}
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

const EMOTION_WORDS = [
  // English
  "shocking","amazing","incredible","unbelievable","stunning","heartbreaking","tragic",
  "secret","revealed","mystery","surprising","powerful","urgent","huge","massive","win","loss",
  "warning","danger","crisis","hope","love","fear","dream","truth",
  // Hindi (Devanagari)
  "बड़ा","बड़ी","चौंकाने","रहस्य","खुलासा","खतरा","संकट","जीत","हार","उम्मीद","डर",
  // Tamil
  "அதிர்ச்சி","ரகசியம்","ஆபத்து","வெற்றி","தோல்வி",
  // Bengali
  "চাঞ্চল্যকর","রহস্য","বিপদ","জয়","পরাজয়",
];

function scoreHeadline(text: string): { label: string; pass: boolean }[] {
  const t = text.trim();
  const lower = t.toLowerCase();
  const chars = t.length;
  const words = t.split(/\s+/).filter(Boolean);
  const firstFour = words.slice(0, 4).join(" ").toLowerCase();
  // Heuristic "primary keyword" = the longest content word (≥5 chars)
  const longest = [...words].sort((a, b) => b.length - a.length)[0] ?? "";
  const keywordEarly = longest.length >= 5 && firstFour.includes(longest.toLowerCase());
  const lengthIdeal = chars >= 50 && chars <= 75;
  const hasEmotion = EMOTION_WORDS.some((w) => lower.includes(w.toLowerCase()));
  const hasNumber = /\b\d+\b|[०-९]|[०-९]|[০-৯]|[౦-౯]|[௦-௯]|[೦-೯]|[൦-൯]|[੦-੯]/.test(t);

  return [
    { label: keywordEarly ? "Primary keyword appears in first 4 words" : "Front-load the primary keyword", pass: keywordEarly },
    { label: lengthIdeal ? `Length is ${chars} chars (ideal 50–75)` : `Length is ${chars} chars (aim for 50–75)`, pass: lengthIdeal },
    { label: hasEmotion ? "Emotional trigger word detected" : "No emotional trigger word detected", pass: hasEmotion },
    { label: hasNumber ? "Contains a number / data point" : "Consider adding a number or data point", pass: hasNumber },
  ];
}

function HeadlineCard({ label, tint, text }: { label: string; tint: string; text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  const checks = scoreHeadline(text);
  const passed = checks.filter((c) => c.pass).length;
  const score = Math.round((passed / checks.length) * 100);
  return (
    <div className="rounded-xl border border-border/60 bg-background/40 p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className={`text-[11px] uppercase tracking-wider font-semibold ${tint}`}>{label}</span>
        <button onClick={copy} className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[11px] hover:bg-accent">
          {copied ? <Check size={11} /> : <Copy size={11} />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <p className="text-sm leading-snug">{text}</p>
      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
        <span className="tabular-nums font-semibold text-foreground">{score}/100</span>
        <span>·</span>
        <span>{text.length} chars</span>
      </div>
      <ul className="mt-1 space-y-1">
        {checks.map((c, i) => (
          <li key={i} className="flex items-start gap-1.5 text-[11px]">
            <span className={c.pass ? "text-emerald-400" : "text-rose-400"}>{c.pass ? "✓" : "✗"}</span>
            <span className={c.pass ? "text-muted-foreground" : "text-foreground/80"}>{c.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PlanExpiredState({ message }: { message: string }) {
  const whatsappUrl = getAdminWhatsappUrl(message);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card/40 p-8 text-center shadow-2xl">
        <h1 className="text-xl font-semibold">{message}</h1>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition"
        >
          Contact Admin on WhatsApp
        </a>
      </div>
    </div>
  );
}
