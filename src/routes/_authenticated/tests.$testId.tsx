import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getTest } from "@/lib/tests.functions";
import { ArrowLeft, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/_authenticated/tests/$testId")({
  component: TestDetailPage,
});

function TestDetailPage() {
  const { testId } = Route.useParams();
  const fetch = useServerFn(getTest);
  const q = useQuery({
    queryKey: ["test", testId],
    queryFn: () => fetch({ data: { id: testId } }),
  });

  if (q.isLoading) return <div className="p-10 text-sm text-muted-foreground">Loading…</div>;
  const t = q.data?.test;
  if (!t) return <div className="p-10">Test not found.</div>;

  const variants = [...(t.headline_variants ?? [])].sort((a, b) => b.ctr - a.ctr);
  const best = variants[0];
  const totalImp = variants.reduce((a, v) => a + v.impressions, 0);
  const totalClicks = variants.reduce((a, v) => a + v.clicks, 0);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <Link to="/tests" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft size={14} /> Back to tests
      </Link>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">{t.section || "—"} · {t.language}</div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight mt-1">{t.article_title || "Untitled"}</h1>
          <a href={t.article_url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm text-primary hover:underline">
            {t.article_url} <ExternalLink size={12} />
          </a>
        </div>
        <span className={`inline-flex rounded-full px-2 py-1 text-xs ${
          t.status === "running" ? "bg-primary/15 text-primary" :
          t.status === "completed" ? "bg-emerald-500/15 text-emerald-400" :
          "bg-muted text-muted-foreground"
        }`}>{t.status}</span>
      </div>

      <div className="mt-8 grid grid-cols-3 gap-4">
        <Stat label="Impressions" value={totalImp.toLocaleString()} />
        <Stat label="Clicks" value={totalClicks.toLocaleString()} />
        <Stat label="Overall CTR" value={totalImp > 0 ? `${((totalClicks / totalImp) * 100).toFixed(2)}%` : "—"} />
      </div>

      <h2 className="mt-10 text-lg font-semibold">Variants</h2>
      <div className="mt-4 space-y-3">
        {variants.map((v) => {
          const lift = best && v.id !== best.id && v.ctr > 0 ? ((best.ctr - v.ctr) / v.ctr) * 100 : null;
          const isWinner = v.id === best?.id && t.status === "completed";
          return (
            <div key={v.id} className={`rounded-2xl border p-5 ${isWinner ? "border-primary/50 bg-primary/5" : "border-border/60 bg-card/30"}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex w-7 h-7 items-center justify-center rounded-md bg-muted text-xs font-semibold">{v.variant_label}</span>
                    {v.is_control && <span className="text-xs text-muted-foreground">Control</span>}
                    {isWinner && <span className="text-xs rounded-full bg-primary/20 text-primary px-2 py-0.5">Winner</span>}
                  </div>
                  <p className="mt-2 text-lg font-medium leading-snug">{v.headline_text}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-2xl font-semibold tabular-nums">{(v.ctr * 100).toFixed(2)}%</div>
                  <div className="text-xs text-muted-foreground">CTR</div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-4 gap-4 text-sm">
                <Mini label="Impressions" value={v.impressions.toLocaleString()} />
                <Mini label="Clicks" value={v.clicks.toLocaleString()} />
                <Mini label="Dwell" value={`${Math.round(v.avg_dwell_time_sec)}s`} />
                <Mini label="vs leader" value={lift !== null ? `-${lift.toFixed(1)}%` : "—"} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/30 p-5">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}
function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-medium tabular-nums">{value}</div>
    </div>
  );
}
