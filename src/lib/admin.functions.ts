import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type AdminUserRow = {
  user_id: string;
  email: string | null;
  display_name: string | null;
  organisation_name: string | null;
  phone_number: string | null;
  preferred_language: string;
  plan_tier: "free" | "trial" | "starter" | "growth" | "enterprise";
  trial_start_date: string | null;
  trial_end_date: string | null;
  payment_status: "pending" | "paid" | "overdue" | "cancelled";
  payment_method: string | null;
  utr_reference: string | null;
  admin_notes: string | null;
  api_calls_today: number;
  api_calls_this_month: number;
  api_calls_all_time: number;
  last_active_date: string | null;
  account_blocked: boolean;
  referral_source: string | null;
  manually_upgraded_by: string | null;
  created_at: string;
};

export const checkIsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (error) return { isAdmin: false };
    return { isAdmin: !!data };
  });

export const adminListUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (context.supabase as any).rpc("admin_list_users");
    if (error) throw new Error(error.message);
    return { users: (data ?? []) as AdminUserRow[] };
  });

export const adminMetrics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (context.supabase as any).rpc("admin_summary_metrics");
    if (error) throw new Error(error.message);
    return data as {
      total_signups: number;
      active_trials: number;
      paying_users: number;
      api_calls_today: number;
    };
  });

const UpdateSchema = z.object({
  user_id: z.string().uuid(),
  plan_tier: z.enum(["free", "trial", "starter", "growth", "enterprise"]).optional(),
  payment_status: z.enum(["pending", "paid", "overdue", "cancelled"]).optional(),
  payment_method: z.string().max(40).nullable().optional(),
  utr_reference: z.string().max(120).nullable().optional(),
  admin_notes: z.string().max(2000).nullable().optional(),
  account_blocked: z.boolean().optional(),
  trial_end_date: z.string().optional(),
});

export const adminUpdateUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => UpdateSchema.parse(input))
  .handler(async ({ data, context }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: row, error } = await (context.supabase as any).rpc("admin_update_user", {
      _user_id: data.user_id,
      _plan_tier: data.plan_tier ?? null,
      _payment_status: data.payment_status ?? null,
      _payment_method: data.payment_method ?? null,
      _utr_reference: data.utr_reference ?? null,
      _admin_notes: data.admin_notes ?? null,
      _account_blocked: data.account_blocked ?? null,
      _trial_end_date: data.trial_end_date ?? null,
    });
    if (error) throw new Error(error.message);
    return { user: row as AdminUserRow };
  });
