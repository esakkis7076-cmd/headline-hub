import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { listTests } from "@/lib/tests.functions";
import { Smartphone, Monitor, TrendingUp, IndianRupee, BarChart3 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/analytics")({
  component: AnalyticsPage,
  head: () => ({ meta: [{ title: "Analytics — TestKaro" }] }),
});

type Device = "desktop" | "mobile";

function AnalyticsPage() {
  const fetchTests = useServerFn(listTests);
  const q = useQuery({ queryKey: ["tests"], queryFn: () => fetchTests() });
  const [device, setDevice] = useState<Device>("desktop");
  const [rpm, setRpm] = useState(120); // ₹ per 1000 page views

  const tests = q.data?.tests ?? [];

  const stats = useMemo(() => {
    let imp = 0,
      clicks = 0,
      controlImp = 0,
      controlClicks = 0,
      winnerImp = 0,
      winnerClicks = 0;
    const bySection: Record<string, { imp: number; clicks: number; tests: number }> = {};
    const byWeek: Record<string, { imp: number; clicks: number }> = {};

    for (const t of tests) {
      const vs = t.headline_variants ?? [];
      const sec = t.section || "Uncategorized";
      bySection[sec] ||= { imp: 0, clicks: 0, tests: 0 };
      bySection[sec].tests += 1;

      const week = weekKey(new Date(t.created_at));
      byWeek[week] ||= { imp: 0, clicks: 0 };

      for (const v of vs) {
        imp += v.impressions;
        clicks += v.clicks;
        bySection[sec].imp += v.impressions;
        bySection[sec].clicks += v.clicks;
        byWeek[week].imp += v.impressions;
        byWeek[week].clicks += v.clicks;
        if (v.is_control) {
          controlImp += v.impressions;
          controlClicks += v.clicks;
        }
        if (t.winner_variant_id && v.id === t.winner_variant_id) {
          winnerImp += v.impressions;
          winnerClicks += v.clicks;
        }
      }
    }

    const ctr = imp ? clicks / imp : 0;
    const controlCtr = controlImp ? controlClicks / controlImp : 0;
    const winnerCtr = winnerImp ? winnerClicks / winnerImp : 0;
    const lift = controlCtr ? ((winnerCtr - controlCtr) / controlCtr) * 100 : 0;
    // Estimated incremental clicks if winner replaced control across all impressions
    const incrementalClicks = Math.max(0, (winnerCtr - controlCtr) * imp);
    const estimatedRevenue = (incrementalClicks / 1000) * rpm;

    const sectionRows = Object.entries(bySection)
      .map(([name, s]) => ({ name, ...s, ctr: s.imp ? s.clicks / s.imp : 0 }))
      .sort((a, b) => b.imp - a.imp);

    const weekRows = Object.entries(byWeek)
      .map(([w, s]) => ({ week: w, ...s, ctr: s.imp ? s.clicks / s.imp : 0 }))
      .sort((a, b) => (a.week < b.week ? -1 : 1))
      .slice(-8);

    return { imp, clicks, ctr, lift, incrementalClicks, estimatedRevenue, sectionRows, weekRows };
  }, [tests, rpm]);

  const containerWidth = device === "mobile" ? "max-w-sm" : "max-w-6xl";

  return (
    <div className="px-6 py-10">
      <div className="mx-auto max-w-6xl flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Section performance, weekly trends, and revenue impact from winning headlines.
          </p>
        </div>
        <div className="inline-flex rounded-lg border border-border bg-card p-1">
          <button
            onClick={() => setDevice("desktop")}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
              device === "desktop" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            <Monitor size={12} /> Desktop
          </button>
          <button
            onClick={() => setDevice("mobile")}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
              device === "mobile" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            <Smartphone size={12} /> Mobile
          </button>
        </div>
      </div>

      <div className={`mx-auto mt-8 transition-all ${containerWidth}`}>
        {q.isLoading ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : tests.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/30 p-10 text-center text-muted-foreground">
            No data yet — create a test or load demo data from the dashboard.
          </div>
        ) : (
          <div className="space-y-6">
            <div className={`grid gap-4 ${device === "mobile" ? "grid-cols-2" : "grid-cols-2 lg:grid-cols-4"}`}>
              <Stat icon={BarChart3} label="Impressions" value={stats.imp.toLocaleString()} />
              <Stat icon={BarChart3} label="Clicks" value={stats.clicks.toLocaleString()} />
              <Stat icon={TrendingUp} label="Avg CTR" value={`${(stats.ctr * 100).toFixed(2)}%`} />
              <Stat
                icon={TrendingUp}
                label="Winner lift vs control"
                value={`${stats.lift >= 0 ? "+" : ""}${stats.lift.toFixed(1)}%`}
                accent={stats.lift > 0}
              />
            </div>

            <section className="rounded-2xl border border-border/60 bg-card/30 p-6">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h2 className="font-semibold flex items-center gap-2">
                    <IndianRupee size={16} /> ROI estimate
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    Incremental clicks from winners × your page RPM.
                  </p>
                </div>
                <label className="text-xs text-muted-foreground flex items-center gap-2">
                  RPM (₹ / 1000 views)
                  <input
                    type="number"
                    min={1}
                    value={rpm}
                    onChange={(e) => setRpm(Math.max(1, Number(e.target.value) || 1))}
                    className="w-20 rounded-md border border-border bg-background px-2 py-1 text-xs"
                  />
                </label>
              </div>
              <div className={`mt-5 grid gap-4 ${device === "mobile" ? "grid-cols-1" : "grid-cols-3"}`}>
                <Mini label="Incremental clicks" value={Math.round(stats.incrementalClicks).toLocaleString()} />
                <Mini label="Estimated extra revenue" value={`₹ ${Math.round(stats.estimatedRevenue).toLocaleString()}`} />
                <Mini label="Per test average" value={`₹ ${Math.round(stats.estimatedRevenue / Math.max(1, tests.length)).toLocaleString()}`} />
              </div>
            </section>

            <section className="rounded-2xl border border-border/60 bg-card/30 p-6">
              <h2 className="font-semibold mb-4">Section performance</h2>
              <div className="space-y-3">
                {stats.sectionRows.map((s) => {
                  const max = Math.max(...stats.sectionRows.map((x) => x.ctr), 0.0001);
                  return (
                    <div key={s.name}>
                      <div className="flex items-center justify-between text-sm">
                        <div className="font-medium">{s.name}</div>
                        <div className="text-muted-foreground tabular-nums text-xs">
                          {s.tests} tests · {s.imp.toLocaleString()} imp ·{" "}
                          <span className="text-foreground font-medium">{(s.ctr * 100).toFixed(2)}% CTR</span>
                        </div>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${(s.ctr / max) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="rounded-2xl border border-border/60 bg-card/30 p-6">
              <h2 className="font-semibold mb-4">Weekly trend</h2>
              <WeeklyChart rows={stats.weekRows} mobile={device === "mobile"} />
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

function WeeklyChart({ rows, mobile }: { rows: { week: string; imp: number; clicks: number; ctr: number }[]; mobile: boolean }) {
  if (rows.length === 0) return <div className="text-sm text-muted-foreground">Not enough data.</div>;
  const max = Math.max(...rows.map((r) => r.ctr), 0.0001);
  return (
    <div className={`flex items-end gap-2 ${mobile ? "h-32" : "h-40"}`}>
      {rows.map((r) => (
        <div key={r.week} className="flex-1 flex flex-col items-center gap-1.5">
          <div className="text-[10px] text-muted-foreground tabular-nums">{(r.ctr * 100).toFixed(1)}%</div>
          <div
            className="w-full rounded-t-md bg-gradient-to-t from-primary/30 to-primary"
            style={{ height: `${(r.ctr / max) * 100}%`, minHeight: 4 }}
            title={`${r.week}: ${(r.ctr * 100).toFixed(2)}% CTR`}
          />
          <div className="text-[10px] text-muted-foreground">{r.week.slice(5)}</div>
        </div>
      ))}
    </div>
  );
}

function Stat({ icon: Icon, label, value, accent }: { icon: React.ComponentType<{ size?: number }>; label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/30 p-5">
      <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider">
        <Icon size={14} />
        {label}
      </div>
      <div className={`mt-2 text-2xl font-semibold tabular-nums ${accent ? "text-primary" : ""}`}>{value}</div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/40 bg-background/40 p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function weekKey(d: Date): string {
  // ISO-ish year-week
  const dt = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = dt.getUTCDay() || 7;
  dt.setUTCDate(dt.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(dt.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((dt.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${dt.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}
