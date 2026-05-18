import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { getMyWorkspace, createPublication, seedDemoData } from "@/lib/workspace.functions";
import { listTests } from "@/lib/tests.functions";
import { ArrowUpRight, Sparkles, FlaskConical, Trophy, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
  head: () => ({ meta: [{ title: "Dashboard — TestKaro" }] }),
});

function DashboardPage() {
  const fetchWs = useServerFn(getMyWorkspace);
  const fetchTests = useServerFn(listTests);
  const seed = useServerFn(seedDemoData);
  const qc = useQueryClient();

  const ws = useQuery({ queryKey: ["workspace"], queryFn: () => fetchWs() });
  const tests = useQuery({
    queryKey: ["tests"],
    queryFn: () => fetchTests(),
    enabled: !!ws.data?.publication,
  });

  const seedMut = useMutation({
    mutationFn: () => seed(),
    onSuccess: () => {
      toast.success("Demo data created");
      qc.invalidateQueries({ queryKey: ["tests"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (ws.isLoading) return <PageShell><div className="text-sm text-muted-foreground">Loading…</div></PageShell>;

  if (!ws.data?.publication) {
    return (
      <PageShell>
        <OnboardingForm />
      </PageShell>
    );
  }

  const list = tests.data?.tests ?? [];
  const running = list.filter((t) => t.status === "running").length;
  const completed = list.filter((t) => t.status === "completed").length;
  const totalImpressions = list.reduce(
    (acc, t) => acc + (t.headline_variants?.reduce((a, v) => a + (v.impressions ?? 0), 0) ?? 0),
    0,
  );
  const totalClicks = list.reduce(
    (acc, t) => acc + (t.headline_variants?.reduce((a, v) => a + (v.clicks ?? 0), 0) ?? 0),
    0,
  );
  const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

  return (
    <PageShell>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{ws.data.publication.name}</p>
          <h1 className="font-serif text-3xl font-semibold tracking-tight">Dashboard</h1>
        </div>
        <div className="flex gap-2">
          {list.length === 0 && (
            <button
              onClick={() => seedMut.mutate()}
              disabled={seedMut.isPending}
              className="rounded-lg border border-border bg-card px-4 py-2 text-sm hover:bg-accent disabled:opacity-50"
            >
              {seedMut.isPending ? "Seeding…" : "Load demo data"}
            </button>
          )}
          <Link
            to="/tests"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            New test
          </Link>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat icon={FlaskConical} label="Running tests" value={running.toString()} />
        <Stat icon={Trophy} label="Completed" value={completed.toString()} />
        <Stat icon={TrendingUp} label="Avg CTR" value={`${avgCtr.toFixed(2)}%`} />
        <Stat icon={Sparkles} label="Impressions" value={totalImpressions.toLocaleString()} />
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold mb-4">Recent tests</h2>
        {list.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/30 p-10 text-center">
            <p className="text-muted-foreground">No tests yet. Create one or load demo data.</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-border/60 overflow-hidden bg-card/30">
            <table className="w-full text-sm">
              <thead className="bg-card/50 text-muted-foreground text-xs uppercase tracking-wider">
                <tr>
                  <th className="text-left px-4 py-3">Article</th>
                  <th className="text-left px-4 py-3">Lang</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-right px-4 py-3">Variants</th>
                  <th className="text-right px-4 py-3">Best CTR</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {list.slice(0, 10).map((t) => {
                  const best = t.headline_variants?.reduce((a, v) => (v.ctr > (a?.ctr ?? 0) ? v : a), t.headline_variants[0]);
                  return (
                    <tr key={t.id} className="border-t border-border/60 hover:bg-card/50">
                      <td className="px-4 py-3 truncate max-w-xs">
                        <div className="font-medium truncate">{t.article_title || t.article_url}</div>
                        <div className="text-xs text-muted-foreground truncate">{t.section}</div>
                      </td>
                      <td className="px-4 py-3 uppercase text-xs text-muted-foreground">{t.language}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs ${
                          t.status === "running" ? "bg-primary/15 text-primary" :
                          t.status === "completed" ? "bg-emerald-500/15 text-emerald-400" :
                          "bg-muted text-muted-foreground"
                        }`}>{t.status}</span>
                      </td>
                      <td className="px-4 py-3 text-right">{t.headline_variants?.length ?? 0}</td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {best ? `${(best.ctr * 100).toFixed(2)}%` : "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          to="/tests/$testId"
                          params={{ testId: t.id }}
                          className="inline-flex items-center gap-1 text-primary text-xs hover:underline"
                        >
                          Open <ArrowUpRight size={12} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </PageShell>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-6xl px-6 py-10">{children}</div>;
}

function Stat({ icon: Icon, label, value }: { icon: React.ComponentType<{ size?: number }>; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/30 p-5">
      <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider">
        <Icon size={14} />
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function OnboardingForm() {
  const create = useServerFn(createPublication);
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [lang, setLang] = useState<"hi" | "bn" | "ta" | "te" | "mr" | "gu" | "kn" | "ml" | "pa" | "en">("hi");

  const mut = useMutation({
    mutationFn: (data: { name: string; domain: string; default_language: typeof lang }) =>
      create({ data }),
    onSuccess: () => {
      toast.success("Workspace created");
      qc.invalidateQueries({ queryKey: ["workspace"] });
      navigate({ to: "/dashboard" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="font-serif text-3xl font-semibold tracking-tight">Welcome to TestKaro</h1>
      <p className="mt-2 text-muted-foreground">Tell us about your publication to get started.</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          mut.mutate({ name, domain, default_language: lang });
        }}
        className="mt-8 space-y-4"
      >
        <div>
          <label className="text-sm">Publication name</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Daily Bharat"
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div>
          <label className="text-sm">Website domain</label>
          <input
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="dailybharat.in"
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div>
          <label className="text-sm">Primary language</label>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as typeof lang)}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="hi">Hindi — हिन्दी</option>
            <option value="bn">Bengali — বাংলা</option>
            <option value="ta">Tamil — தமிழ்</option>
            <option value="te">Telugu — తెలుగు</option>
            <option value="mr">Marathi — मराठी</option>
            <option value="gu">Gujarati — ગુજરાતી</option>
            <option value="kn">Kannada — ಕನ್ನಡ</option>
            <option value="ml">Malayalam — മലയാളം</option>
            <option value="pa">Punjabi — ਪੰਜਾਬੀ</option>
            <option value="en">English</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={mut.isPending}
          className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {mut.isPending ? "Creating…" : "Create workspace"}
        </button>
      </form>
    </div>
  );
}
