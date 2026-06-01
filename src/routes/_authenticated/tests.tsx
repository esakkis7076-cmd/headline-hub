import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { listTests, createTest, suggestHeadlines } from "@/lib/tests.functions";
import { Plus, X, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_authenticated/tests")({
  component: TestsPage,
  head: () => ({ meta: [{ title: "Headline tests — TestKaro" }] }),
});

type Lang = "hi" | "bn" | "ta" | "te" | "mr" | "gu" | "kn" | "ml" | "pa" | "en";

function TestsPage() {
  const fetch = useServerFn(listTests);
  const create = useServerFn(createTest);
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const tests = useQuery({ queryKey: ["tests"], queryFn: () => fetch() });

  const mut = useMutation({
    mutationFn: (data: { article_url: string; article_title?: string; section?: string; language: Lang; variants: { text: string; is_control?: boolean }[] }) => create({ data }),
    onSuccess: () => {
      toast.success("Test created and running");
      qc.invalidateQueries({ queryKey: ["tests"] });
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight">Headline tests</h1>
          <p className="text-muted-foreground mt-1 text-sm">Run A/B tests on any article URL in your native language.</p>
        </div>
        <button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
          <Plus size={14} /> New test
        </button>
      </div>

      {tests.isLoading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : tests.data && tests.data.tests.length > 0 ? (
        <div className="grid gap-3">
          {tests.data.tests.map((t) => {
            const best = t.headline_variants?.reduce((a, v) => (v.ctr > (a?.ctr ?? 0) ? v : a), t.headline_variants[0]);
            return (
              <Link
                key={t.id}
                to="/tests/$testId"
                params={{ testId: t.id }}
                className="rounded-2xl border border-border/60 bg-card/30 p-5 hover:bg-card/60 transition block"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">{t.section || "—"} · {t.language}</div>
                    <div className="font-medium mt-1 truncate">{t.article_title || t.article_url}</div>
                    {best && <div className="mt-2 text-sm text-muted-foreground truncate">Leading: "{best.headline_text}"</div>}
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex rounded-full px-2 py-0.5 text-xs ${
                      t.status === "running" ? "bg-primary/15 text-primary" :
                      t.status === "completed" ? "bg-emerald-500/15 text-emerald-400" :
                      "bg-muted text-muted-foreground"
                    }`}>{t.status}</div>
                    <div className="mt-2 text-lg font-semibold tabular-nums">
                      {best ? `${(best.ctr * 100).toFixed(2)}%` : "—"}
                    </div>
                    <div className="text-xs text-muted-foreground">best CTR</div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-card/30 p-10 text-center text-muted-foreground">
          No tests yet — create your first one.
        </div>
      )}

      {open && <NewTestModal onClose={() => setOpen(false)} onSubmit={(data) => mut.mutate(data)} pending={mut.isPending} />}
    </div>
  );
}

function NewTestModal({
  onClose,
  onSubmit,
  pending,
}: {
  onClose: () => void;
  onSubmit: (d: { article_url: string; article_title?: string; section?: string; language: Lang; variants: { text: string; is_control?: boolean }[] }) => void;
  pending: boolean;
}) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [section, setSection] = useState("");
  const [language, setLanguage] = useState<Lang>("hi");
  const [variants, setVariants] = useState(["", ""]);
  const suggest = useServerFn(suggestHeadlines);
  const sugMut = useMutation({
    mutationFn: () => suggest({ data: { article_url: url, article_title: title || undefined, language, control: variants[0] || undefined } }),
    onSuccess: (res) => {
      const newOnes = res.variants.map((v) => v.text);
      setVariants((prev) => {
        const control = prev[0] || newOnes[0];
        return [control, ...newOnes.slice(prev[0] ? 0 : 1)].slice(0, 4);
      });
      toast.success("AI suggested 3 variants");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur p-4">
      <div className="w-full max-w-xl rounded-2xl border border-border/60 bg-card p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-xl font-semibold">New headline test</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const clean = variants.map((v) => v.trim()).filter(Boolean);
            if (clean.length < 2) return toast.error("Add at least 2 variants");
            onSubmit({
              article_url: url,
              article_title: title || undefined,
              section: section || undefined,
              language,
              variants: clean.map((text, i) => ({ text, is_control: i === 0 })),
            });
          }}
          className="space-y-3"
        >
          <input required type="url" placeholder="Article URL" value={url} onChange={(e) => setUrl(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm" />
          <input type="text" placeholder="Article title (optional)" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm" />
          <div className="grid grid-cols-2 gap-3">
            <input type="text" placeholder="Section (Politics, Sports…)" value={section} onChange={(e) => setSection(e.target.value)} className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm" />
            <select value={language} onChange={(e) => setLanguage(e.target.value as Lang)} className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm">
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
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Headline variants</div>
              <button
                type="button"
                disabled={!url || sugMut.isPending}
                onClick={() => sugMut.mutate()}
                className="inline-flex items-center gap-1 text-xs rounded-md border border-border bg-card px-2 py-1 hover:bg-accent disabled:opacity-40"
              >
                <Sparkles size={12} /> {sugMut.isPending ? "Thinking…" : "Suggest with AI"}
              </button>
            </div>
            {variants.map((v, i) => (
              <div key={i} className="flex gap-2">
                <span className="flex-shrink-0 w-7 h-9 inline-flex items-center justify-center rounded-md bg-muted text-xs font-medium">{String.fromCharCode(65 + i)}</span>
                <input value={v} onChange={(e) => setVariants(variants.map((x, ix) => ix === i ? e.target.value : x))} placeholder={i === 0 ? "Original CMS headline (control)" : "Alternative headline"} className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm" />
                {variants.length > 2 && (
                  <button type="button" onClick={() => setVariants(variants.filter((_, ix) => ix !== i))} className="text-muted-foreground hover:text-destructive"><X size={16} /></button>
                )}
              </div>
            ))}
            {variants.length < 4 && (
              <button type="button" onClick={() => setVariants([...variants, ""])} className="text-xs text-primary hover:underline">+ Add variant</button>
            )}
          </div>
          <button type="submit" disabled={pending} className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {pending ? "Creating…" : "Start test"}
          </button>
        </form>
      </div>
    </div>
  );
}
