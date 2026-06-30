import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  analyzeCompetitor,
  listCompetitorReports,
  getCompetitorReport,
  getDomainTrend,
} from "@/lib/competitor.functions";
import { Target, ExternalLink } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend,
} from "recharts";

export const Route = createFileRoute("/_authenticated/competitor")({
  component: CompetitorPage,
  head: () => ({ meta: [{ title: "Competitor headlines — Story Pulse" }] }),
});

type Category = "number" | "question" | "how_to" | "curiosity" | "authority" | "emotional" | "other";

const CATEGORY_LABEL: Record<Category, string> = {
  number: "Number",
  question: "Question",
  how_to: "How-To",
  curiosity: "Curiosity",
  authority: "Authority",
  emotional: "Emotional",
  other: "Other",
};

const CATEGORY_COLORS: Record<Category, string> = {
  number: "hsl(220 80% 60%)",
  question: "hsl(280 70% 60%)",
  how_to: "hsl(160 70% 45%)",
  curiosity: "hsl(35 90% 55%)",
  authority: "hsl(210 30% 55%)",
  emotional: "hsl(0 75% 60%)",
  other: "hsl(0 0% 55%)",
};

const LENGTH_ORDER = ["≤5", "6–8", "9–11", "12–15", "16+"];

function CompetitorPage() {
  const analyze = useServerFn(analyzeCompetitor);
  const list = useServerFn(listCompetitorReports);
  const get = useServerFn(getCompetitorReport);
  const trend = useServerFn(getDomainTrend);
  const qc = useQueryClient();

  const [domain, setDomain] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const reports = useQuery({ queryKey: ["competitor-reports"], queryFn: () => list() });

  const mut = useMutation({
    mutationFn: (d: { domain: string }) => analyze({ data: d }),
    onSuccess: (res) => {
      toast.success(`Analyzed ${res.report.headlines_collected} headlines`);
      setSelectedId(res.report.id);
      qc.invalidateQueries({ queryKey: ["competitor-reports"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const activeId = selectedId ?? reports.data?.reports[0]?.id ?? null;

  const report = useQuery({
    queryKey: ["competitor-report", activeId],
    queryFn: () => get({ data: { id: activeId as string } }),
    enabled: !!activeId,
  });

  const activeDomain = report.data?.report.domain as string | undefined;

  const trendQ = useQuery({
    queryKey: ["competitor-trend", activeDomain],
    queryFn: () => trend({ data: { domain: activeDomain as string } }),
    enabled: !!activeDomain,
  });

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <h1 className="font-serif text-3xl font-semibold tracking-tight">Competitor Headlines</h1>
      <p className="text-muted-foreground mt-1 text-sm">
        Crawl up to 500 recent headlines from any news domain. See the patterns, formats, and emotional triggers competitors lean on.
      </p>

      <form
        onSubmit={(e) => { e.preventDefault(); mut.mutate({ domain }); }}
        className="mt-6 rounded-2xl border border-border/60 bg-card/30 p-5 flex flex-col sm:flex-row gap-3"
      >
        <input
          required type="text" placeholder="thehindu.com" value={domain}
          onChange={(e) => setDomain(e.target.value)}
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
        />
        <button
          type="submit" disabled={mut.isPending}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          <Target size={14} />
          {mut.isPending ? "Crawling… (up to 90s)" : "Analyze domain"}
        </button>
      </form>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
        <aside className="rounded-2xl border border-border/60 bg-card/30 p-3">
          <div className="px-2 pb-2 text-xs uppercase tracking-wider text-muted-foreground">Saved reports</div>
          {reports.isLoading && <div className="px-2 py-4 text-sm text-muted-foreground">Loading…</div>}
          {!reports.isLoading && (reports.data?.reports.length ?? 0) === 0 && (
            <div className="px-2 py-4 text-sm text-muted-foreground">No reports yet.</div>
          )}
          <ul className="flex flex-col gap-1">
            {reports.data?.reports.map((r) => {
              const active = r.id === activeId;
              return (
                <li key={r.id}>
                  <button
                    onClick={() => setSelectedId(r.id)}
                    className={`w-full text-left rounded-lg px-3 py-2 text-sm transition ${
                      active ? "bg-primary/15 text-primary" : "hover:bg-accent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <div className="font-medium truncate">{r.domain}</div>
                    <div className="text-xs opacity-70">
                      {r.headlines_collected} headlines · {new Date(r.created_at as string).toLocaleDateString()}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        <div className="min-w-0">
          {!activeId && (
            <div className="rounded-2xl border border-dashed border-border/60 bg-card/20 p-10 text-center text-sm text-muted-foreground">
              Run an analysis to see the dashboard.
            </div>
          )}
          {activeId && report.isLoading && (
            <div className="rounded-2xl border border-border/60 bg-card/30 p-10 text-center text-sm text-muted-foreground">
              Loading report…
            </div>
          )}
          {report.data && (
            <ReportView
              report={report.data.report as unknown as ReportRow}
              trend={(trendQ.data?.trend ?? []) as unknown as TrendRow[]}
            />
          )}
        </div>
      </div>
    </div>
  );
}

type ReportRow = {
  id: string;
  domain: string;
  headlines_collected: number;
  category_counts: Record<Category, number>;
  length_buckets: Record<string, number>;
  top_patterns: { pattern: string; count: number }[];
  emotional_triggers: { word: string; count: number }[];
  sample_headlines: { title: string; url: string; categories: Category[] }[];
  created_at: string;
};

type TrendRow = { created_at: string; category_counts: Record<Category, number>; headlines_collected: number };

function ReportView({ report, trend }: { report: ReportRow; trend: TrendRow[] }) {
  const total = report.headlines_collected || 1;

  const categoryData = useMemo(
    () =>
      (Object.keys(CATEGORY_LABEL) as Category[])
        .filter((c) => c !== "other")
        .map((c) => ({
          category: CATEGORY_LABEL[c],
          key: c,
          count: report.category_counts[c] ?? 0,
          pct: Math.round(((report.category_counts[c] ?? 0) / total) * 1000) / 10,
        })),
    [report, total],
  );

  const lengthData = useMemo(
    () => LENGTH_ORDER.map((bucket) => ({ bucket, count: report.length_buckets[bucket] ?? 0 })),
    [report],
  );

  const trendData = useMemo(
    () =>
      trend.map((t) => {
        const tot = t.headlines_collected || 1;
        const row: Record<string, number | string> = { date: new Date(t.created_at).toLocaleDateString() };
        for (const c of Object.keys(CATEGORY_LABEL) as Category[]) {
          if (c === "other") continue;
          row[CATEGORY_LABEL[c]] = Math.round(((t.category_counts[c] ?? 0) / tot) * 1000) / 10;
        }
        return row;
      }),
    [trend],
  );

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Domain</div>
          <div className="font-serif text-2xl font-semibold">{report.domain}</div>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Headlines analyzed</div>
          <div className="text-3xl font-semibold tabular-nums text-primary">{report.headlines_collected}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Panel title="Headline format usage">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" tickFormatter={(v) => `${v}%`} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis type="category" dataKey="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={90} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number, _n, p) => [`${v}% (${p.payload.count})`, "Share"]}
                />
                <Bar dataKey="pct" radius={[0, 6, 6, 0]} fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <Table
            rows={categoryData.map((c) => [c.category, `${c.pct}%`, String(c.count)])}
            headers={["Format", "Usage", "Count"]}
          />
        </Panel>

        <Panel title="Headline length (words)">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={lengthData}>
                <XAxis dataKey="bucket" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <Panel title="Top opening patterns">
        {report.top_patterns.length === 0 ? (
          <div className="text-sm text-muted-foreground">No repeating patterns detected.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {report.top_patterns.slice(0, 12).map((p) => (
              <div key={p.pattern} className="flex items-center justify-between rounded-lg border border-border/60 bg-background/40 px-3 py-2 text-sm">
                <span className="truncate font-medium">{p.pattern}</span>
                <span className="text-muted-foreground tabular-nums">{p.count}</span>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <Panel title="Emotional triggers">
        {report.emotional_triggers.length === 0 ? (
          <div className="text-sm text-muted-foreground">No emotional triggers detected in this sample.</div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {report.emotional_triggers.slice(0, 25).map((e) => (
              <span
                key={e.word}
                className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-destructive/10 px-3 py-1 text-xs"
              >
                <span className="font-medium">{e.word}</span>
                <span className="text-muted-foreground tabular-nums">{e.count}</span>
              </span>
            ))}
          </div>
        )}
      </Panel>

      {trendData.length >= 2 && (
        <Panel title={`Trend for ${report.domain} (% by format over time)`}>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `${v}%`} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {(Object.keys(CATEGORY_LABEL) as Category[])
                  .filter((c) => c !== "other")
                  .map((c) => (
                    <Line key={c} type="monotone" dataKey={CATEGORY_LABEL[c]} stroke={CATEGORY_COLORS[c]} strokeWidth={2} dot={false} />
                  ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      )}

      <Panel title="Sample headlines">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="text-left py-2 pr-3">Headline</th><th className="text-left py-2 pr-3">Formats</th><th /></tr>
            </thead>
            <tbody>
              {report.sample_headlines.slice(0, 40).map((s, i) => (
                <tr key={i} className="border-t border-border/40">
                  <td className="py-2 pr-3">{s.title}</td>
                  <td className="py-2 pr-3">
                    <div className="flex flex-wrap gap-1">
                      {s.categories.map((c) => (
                        <span key={c} className="rounded-md px-1.5 py-0.5 text-[10px] font-medium" style={{ background: CATEGORY_COLORS[c] + "22", color: CATEGORY_COLORS[c] }}>
                          {CATEGORY_LABEL[c]}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-2 text-right">
                    <a href={s.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary">
                      <ExternalLink size={12} />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border/60 bg-card/30 p-5">
      <h2 className="font-semibold mb-4">{title}</h2>
      {children}
    </section>
  );
}

function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-xs uppercase tracking-wider text-muted-foreground">
          <tr>{headers.map((h) => <th key={h} className="text-left py-2 pr-3">{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-border/40">
              {r.map((c, j) => <td key={j} className="py-2 pr-3 tabular-nums">{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
