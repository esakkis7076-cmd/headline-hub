import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  checkIsAdmin,
  adminListUsers,
  adminMetrics,
  adminUpdateUser,
  type AdminUserRow,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminPage,
  head: () => ({ meta: [{ title: "Admin — Story Pulse" }] }),
});

const PLAN_TIERS = ["free", "trial", "starter", "growth", "enterprise"] as const;
const PAYMENT_STATUSES = ["pending", "paid", "overdue", "cancelled"] as const;

const planBadge: Record<string, string> = {
  free: "bg-muted text-muted-foreground",
  trial: "bg-amber-500/20 text-amber-400",
  starter: "bg-sky-500/20 text-sky-400",
  growth: "bg-emerald-500/20 text-emerald-400",
  enterprise: "bg-fuchsia-500/20 text-fuchsia-400",
};

function AdminPage() {
  const navigate = useNavigate();
  const checkAdmin = useServerFn(checkIsAdmin);
  const listUsers = useServerFn(adminListUsers);
  const metrics = useServerFn(adminMetrics);

  const adminQ = useQuery({ queryKey: ["is-admin"], queryFn: () => checkAdmin() });

  useEffect(() => {
    if (adminQ.data && !adminQ.data.isAdmin) {
      toast.error("Admin only");
      navigate({ to: "/aeo" });
    }
  }, [adminQ.data, navigate]);

  const isAdmin = adminQ.data?.isAdmin === true;

  const usersQ = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => listUsers(),
    enabled: isAdmin,
  });
  const metricsQ = useQuery({
    queryKey: ["admin-metrics"],
    queryFn: () => metrics(),
    enabled: isAdmin,
  });

  if (adminQ.isPending) {
    return <div className="px-6 py-10 text-sm text-muted-foreground">Checking access…</div>;
  }
  if (!isAdmin) return null;

  const m = metricsQ.data;

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-10">
      <h1 className="font-serif text-3xl font-semibold tracking-tight">Admin</h1>
      <p className="text-muted-foreground mt-1 text-sm">User management, billing, and usage.</p>

      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Total signups" value={m?.total_signups} />
        <MetricCard label="Active trials" value={m?.active_trials} />
        <MetricCard label="Paying users" value={m?.paying_users} />
        <MetricCard label="API calls today" value={m?.api_calls_today} />
      </div>

      <div className="mt-8 rounded-2xl border border-border/60 bg-card/30 overflow-x-auto">
        <table className="min-w-full text-xs">
          <thead className="bg-muted/30 text-muted-foreground uppercase tracking-wider">
            <tr>
              <th className="text-left px-3 py-2">Email</th>
              <th className="text-left px-3 py-2">Org</th>
              <th className="text-left px-3 py-2">Phone</th>
              <th className="text-left px-3 py-2">Lang</th>
              <th className="text-left px-3 py-2">Plan</th>
              <th className="text-left px-3 py-2">Trial end</th>
              <th className="text-right px-3 py-2">Mo</th>
              <th className="text-right px-3 py-2">All</th>
              <th className="text-left px-3 py-2">Last active</th>
              <th className="text-left px-3 py-2">Payment</th>
              <th className="text-left px-3 py-2">Method</th>
              <th className="text-left px-3 py-2">UTR</th>
              <th className="text-left px-3 py-2 w-48">Notes</th>
              <th className="text-left px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {usersQ.isPending && (
              <tr><td colSpan={14} className="px-3 py-6 text-center text-muted-foreground">Loading…</td></tr>
            )}
            {usersQ.data?.users.map((u) => (
              <UserRow key={u.user_id} user={u} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: number | undefined }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/30 p-5">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-2 text-3xl font-semibold tabular-nums text-primary">
        {value ?? "—"}
      </div>
    </div>
  );
}

function UserRow({ user }: { user: AdminUserRow }) {
  const qc = useQueryClient();
  const updateFn = useServerFn(adminUpdateUser);
  const mut = useMutation({
    mutationFn: (patch: Partial<AdminUserRow>) =>
      updateFn({ data: { user_id: user.user_id, ...patch } as never }),
    onSuccess: () => {
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      qc.invalidateQueries({ queryKey: ["admin-metrics"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const [notes, setNotes] = useState(user.admin_notes ?? "");
  const [utr, setUtr] = useState(user.utr_reference ?? "");
  const [method, setMethod] = useState(user.payment_method ?? "");

  useEffect(() => { setNotes(user.admin_notes ?? ""); }, [user.admin_notes]);
  useEffect(() => { setUtr(user.utr_reference ?? ""); }, [user.utr_reference]);
  useEffect(() => { setMethod(user.payment_method ?? ""); }, [user.payment_method]);

  const trial = useMemo(
    () => (user.trial_end_date ? new Date(user.trial_end_date).toLocaleDateString() : "—"),
    [user.trial_end_date],
  );
  const lastActive = useMemo(
    () => (user.last_active_date ? new Date(user.last_active_date).toLocaleDateString() : "—"),
    [user.last_active_date],
  );

  return (
    <tr className={`border-t border-border/40 ${user.account_blocked ? "opacity-60" : ""}`}>
      <td className="px-3 py-2 max-w-[180px] truncate">{user.email}</td>
      <td className="px-3 py-2 max-w-[160px] truncate">{user.organisation_name ?? "—"}</td>
      <td className="px-3 py-2">{user.phone_number ?? "—"}</td>
      <td className="px-3 py-2 uppercase">{user.preferred_language}</td>
      <td className="px-3 py-2">
        <select
          value={user.plan_tier}
          onChange={(e) => mut.mutate({ plan_tier: e.target.value as AdminUserRow["plan_tier"] })}
          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold border-0 ${planBadge[user.plan_tier]}`}
        >
          {PLAN_TIERS.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </td>
      <td className="px-3 py-2 whitespace-nowrap">{trial}</td>
      <td className="px-3 py-2 text-right tabular-nums">{user.api_calls_this_month}</td>
      <td className="px-3 py-2 text-right tabular-nums">{user.api_calls_all_time}</td>
      <td className="px-3 py-2 whitespace-nowrap">{lastActive}</td>
      <td className="px-3 py-2">
        <select
          value={user.payment_status}
          onChange={(e) => mut.mutate({ payment_status: e.target.value as AdminUserRow["payment_status"] })}
          className="rounded-md bg-background border border-border px-1.5 py-0.5 text-[11px]"
        >
          {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </td>
      <td className="px-3 py-2">
        <input
          value={method}
          placeholder="UPI/bank…"
          onChange={(e) => setMethod(e.target.value)}
          onBlur={() => method !== (user.payment_method ?? "") && mut.mutate({ payment_method: method })}
          className="w-24 rounded-md bg-background border border-border px-1.5 py-0.5 text-[11px]"
        />
      </td>
      <td className="px-3 py-2">
        <input
          value={utr}
          placeholder="UTR ref"
          onChange={(e) => setUtr(e.target.value)}
          onBlur={() => utr !== (user.utr_reference ?? "") && mut.mutate({ utr_reference: utr })}
          className="w-28 rounded-md bg-background border border-border px-1.5 py-0.5 text-[11px]"
        />
      </td>
      <td className="px-3 py-2">
        <textarea
          value={notes}
          placeholder="notes…"
          rows={1}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={() => notes !== (user.admin_notes ?? "") && mut.mutate({ admin_notes: notes })}
          className="w-44 rounded-md bg-background border border-border px-1.5 py-0.5 text-[11px] resize-y"
        />
      </td>
      <td className="px-3 py-2 whitespace-nowrap">
        <button
          onClick={() => mut.mutate({ account_blocked: !user.account_blocked })}
          className={`rounded-md px-2 py-1 text-[11px] font-semibold ${
            user.account_blocked
              ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
              : "bg-destructive/20 text-destructive hover:bg-destructive/30"
          }`}
        >
          {user.account_blocked ? "Unblock" : "Block"}
        </button>
        <a
          href={`mailto:${user.email}`}
          className="ml-2 rounded-md px-2 py-1 text-[11px] font-semibold bg-muted hover:bg-accent"
        >
          Email
        </a>
      </td>
    </tr>
  );
}
