import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import {
  analyzeContentGap,
  listContentGapReports,
  getContentGapReport,
} from "@/lib/content-gap.functions";
import { GitCompare, TrendingUp, Lightbulb } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

export const Route = createFileRoute("/_authenticated/content-gap")({
  component: ContentGapPage,
  head: () => ({ meta: [{ title: "Content Gap Analysis — TestKaro" }] }),
});

type TopicEntry = { topic: string; count: number };
type UnderCovered = { topic: string; user_count: number; competitor_count: number };
type Recommendation = {
  topic: string;
  opportunity_score: number;
  estimated_impact: "low" | "medium" | "high";
  suggested_article_ideas: string[];
  rationale: string;
};

type ReportRow = {
  id: string;
  user_domain: string;
  competitor_domain: string;
  user_url_count: number;
  competitor_url_count: number;
  user_topics: TopicEntry[];
  competitor_topics: TopicEntry[];
  missing_topics: TopicEntry[];
  under_covered_topics: UnderCovered[];
  recommendations: Recommendation[];
  summary: string | null;
  created_at: string;
};

function ContentGapPage() {
  const analyze = useServerFn(analyzeContentGap);
  const list = useServerFn(listContentGapReports);
  const get = useServerFn(getContentGapReport);
  const qc = useQueryClient();

  const [userDomain, setUserDomain] = useState("");
  const [competitorDomain, setCompetitorDomain] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const reports = useQuery({ queryKey: ["content-gap-reports"], queryFn: () => list() });

  const mut = useMutation({
    mutationFn: (d: { user_domain: string; competitor_domain: string }) => analyze({ data: d }),
    onSuccess: (res) => {
      const missing = Array.isArray(res.report.missing_topics) ? res.report.missing_topics.length : 0;
      toast.success(`Analyzed: ${missing} missing topics`);
      setSelectedId(res.report.id);
      qc.invalidateQueries({ queryKey: ["content-gap-reports"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const activeId = selectedId ?? reports.data?.reports[0]?.id ?? null;

  const report = useQuery({
    queryKey: ["content-gap-report", activeId],
    queryFn: () => get({ data: { id: activeId as string } }),
    enabled: !!activeId,
  });

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <h1 className="font-serif text-3xl font-semibold tracking-tight">Content Gap Analysis</h1>
      <p className="text-muted-foreground mt-1 text-sm max-w-2xl">
        Compare your domain against a competitor. We crawl both sitemaps, extract topics, surface what they cover that you don't, and recommend article ideas with opportunity scores.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          mut.mutate({ user_domain: userDomain, competitor_domain: competitorDomain });
        }}
        className="mt-6 rounded-2xl border border-border/60 bg-card/30 p-5 grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3"
      >
        <div>
          <label className="text-xs uppercase tracking-wider text-muted-foreground">Your domain</label>
          <input
            required type="text" placeholder="yoursite.com" value={userDomain}
            onChange={(e) => setUserDomain(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-wider text-muted-foreground">Competitor</label>
          <input
            required type="text" placeholder="competitor.com" value={competitorDomain}
            onChange={(e) => setCompetitorDomain(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"
          />
        </div>
        <button
          type="submit" disabled={mut.isPending}
          className="self-end inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          <GitCompare size={14} />
          {mut.isPending ? "Analyzing… (up to 60s)" : "Compare"}
        </button>
      </form>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
        <aside className="rounded-2xl border border-border/60 bg-card/30 p-3">
          <div className="px-2 pb-2 text-xs uppercase tracking-wider text-muted-foreground">Saved comparisons</div>
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
                    <div className="font-medium truncate">{r.user_domain} vs {r.competitor_domain}</div>
                    <div className="text-xs opacity-70">{new Date(r.created_at as string).toLocaleDateString()}</div>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        <div className="min-w-0">
          {!activeId && (
            <div className="rounded-2xl border border-dashed border-border/60 bg-card/20 p-10 text-center text-sm text-muted-foreground">
              Run a comparison to see the dashboard.
            </div>
          )}
          {activeId && report.isLoading && (
            <div className="rounded-2xl border border-border/60 bg-card/30 p-10 text-center text-sm text-muted-foreground">
              Loading report…
            </div>
          )}
          {report.data && <ReportView report={report.data.report as unknown as ReportRow} />}
        </div>
      </div>
    </div>
  );
}

function ReportView({ report }: { report: ReportRow }) {
  const compareData = (report.missing_topics.slice(0, 10)).map((t) => ({
    topic: t.topic,
    competitor: t.count,
    you: 0,
  })).concat(
    report.under_covered_topics.slice(0, 5).map((t) => ({
      topic: t.topic,
      competitor: t.competitor_count,
      you: t.user_count,
    })),
  );

  const impactColor = (i: string) =>
    i === "high" ? "hsl(0 75% 60%)" : i === "medium" ? "hsl(35 90% 55%)" : "hsl(210 30% 55%)";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Your URLs" value={report.user_url_count} />
        <Stat label="Competitor URLs" value={report.competitor_url_count} />
        <Stat label="Missing topics" value={report.missing_topics.length} accent />
        <Stat label="Under-covered" value={report.under_covered_topics.length} />
      </div>

      {report.summary && (
        <section className="rounded-2xl border border-primary/30 bg-primary/5 p-5">
          <div className="flex items-start gap-3">
            <Lightbulb className="text-primary mt-0.5" size={18} />
            <div>
              <h2 className="font-semibold mb-1">Strategy summary</h2>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{report.summary}</p>
            </div>
          </div>
        </section>
      )}

      <Panel title="Coverage comparison (top gaps)">
        {compareData.length === 0 ? (
          <div className="text-sm text-muted-foreground">No significant gaps detected.</div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={compareData} layout="vertical" margin={{ left: 60 }}>
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis type="category" dataKey="topic" stroke="hsl(var(--muted-foreground))" fontSize={11} width={120} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="you" name={report.user_domain} fill="hsl(220 70% 60%)" radius={[0, 4, 4, 0]} />
                <Bar dataKey="competitor" name={report.competitor_domain} fill="hsl(0 75% 60%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Panel>

      <Panel title="Recommended content opportunities">
        {report.recommendations.length === 0 ? (
          <div className="text-sm text-muted-foreground">No recommendations generated.</div>
        ) : (
          <div className="space-y-3">
            {report.recommendations.map((r, i) => (
              <div key={i} className="rounded-xl border border-border/60 bg-background/40 p-4">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="min-w-0">
                    <div className="font-semibold capitalize">{r.topic}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{r.rationale}</div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Opportunity</div>
                      <div className="text-xl font-bold tabular-nums text-primary">{r.opportunity_score}</div>
                    </div>
                    <span
                      className="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider"
                      style={{ background: impactColor(r.estimated_impact) + "22", color: impactColor(r.estimated_impact) }}
                    >
                      {r.estimated_impact} impact
                    </span>
                  </div>
                </div>
                {r.suggested_article_ideas?.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border/40">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">Article ideas</div>
                    <ul className="space-y-1">
                      {r.suggested_article_ideas.map((idea, j) => (
                        <li key={j} className="text-sm flex items-start gap-2">
                          <TrendingUp size={12} className="mt-1 text-primary shrink-0" />
                          <span>{idea}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Panel>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Panel title={`Missing topics (${report.missing_topics.length})`}>
          <TopicTable rows={report.missing_topics.slice(0, 30).map((t) => [t.topic, String(t.count)])} headers={["Topic", "Competitor count"]} />
        </Panel>
        <Panel title={`Under-covered (${report.under_covered_topics.length})`}>
          <TopicTable
            rows={report.under_covered_topics.slice(0, 30).map((t) => [t.topic, String(t.user_count), String(t.competitor_count)])}
            headers={["Topic", "You", "Competitor"]}
          />
        </Panel>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/30 p-4">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`text-3xl font-bold tabular-nums mt-1 ${accent ? "text-primary" : ""}`}>{value}</div>
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

function TopicTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  if (rows.length === 0) return <div className="text-sm text-muted-foreground">None.</div>;
  return (
    <div className="overflow-x-auto max-h-96 overflow-y-auto">
      <table className="w-full text-sm">
        <thead className="text-xs uppercase tracking-wider text-muted-foreground sticky top-0 bg-card">
          <tr>{headers.map((h) => <th key={h} className="text-left py-2 pr-3">{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-border/40">
              {r.map((c, j) => (
                <td key={j} className={`py-2 pr-3 ${j === 0 ? "capitalize" : "tabular-nums"}`}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
