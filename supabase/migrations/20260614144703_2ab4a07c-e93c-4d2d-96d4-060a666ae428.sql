
-- 1. Add new columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS organisation_name text,
  ADD COLUMN IF NOT EXISTS phone_number text,
  ADD COLUMN IF NOT EXISTS plan_tier text NOT NULL DEFAULT 'trial',
  ADD COLUMN IF NOT EXISTS trial_start_date timestamptz,
  ADD COLUMN IF NOT EXISTS trial_end_date timestamptz,
  ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS payment_method text,
  ADD COLUMN IF NOT EXISTS utr_reference text,
  ADD COLUMN IF NOT EXISTS admin_notes text,
  ADD COLUMN IF NOT EXISTS api_calls_today integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS api_calls_this_month integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS api_calls_all_time integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_active_date timestamptz,
  ADD COLUMN IF NOT EXISTS account_blocked boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS languages_used text[] NOT NULL DEFAULT ARRAY[]::text[],
  ADD COLUMN IF NOT EXISTS referral_source text,
  ADD COLUMN IF NOT EXISTS manually_upgraded_by text;

-- Allow plan-tier validation
DO $$ BEGIN
  ALTER TABLE public.profiles ADD CONSTRAINT profiles_plan_tier_check
    CHECK (plan_tier IN ('free','trial','starter','growth','enterprise'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.profiles ADD CONSTRAINT profiles_payment_status_check
    CHECK (payment_status IN ('pending','paid','overdue','cancelled'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. Backfill trial dates for existing users from auth.users.created_at
UPDATE public.profiles p
SET trial_start_date = COALESCE(p.trial_start_date, u.created_at),
    trial_end_date   = COALESCE(p.trial_end_date,   u.created_at + interval '14 days')
FROM auth.users u
WHERE p.user_id = u.id
  AND (p.trial_start_date IS NULL OR p.trial_end_date IS NULL);

-- 3. Lock down: prevent users from changing billing/admin fields on themselves
CREATE OR REPLACE FUNCTION public.prevent_profile_publication_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  is_admin boolean := app_private.has_role(auth.uid(), 'admin'::app_role);
BEGIN
  IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN
    RAISE EXCEPTION 'Changing user_id is not permitted';
  END IF;
  IF NEW.publication_id IS DISTINCT FROM OLD.publication_id AND NOT is_admin THEN
    RAISE EXCEPTION 'Changing publication_id is not permitted';
  END IF;
  IF NOT is_admin THEN
    -- restore protected fields to their previous values for non-admin writers
    NEW.plan_tier            := OLD.plan_tier;
    NEW.trial_start_date     := OLD.trial_start_date;
    NEW.trial_end_date       := OLD.trial_end_date;
    NEW.payment_status       := OLD.payment_status;
    NEW.payment_method       := OLD.payment_method;
    NEW.utr_reference        := OLD.utr_reference;
    NEW.admin_notes          := OLD.admin_notes;
    NEW.account_blocked      := OLD.account_blocked;
    NEW.manually_upgraded_by := OLD.manually_upgraded_by;
    NEW.api_calls_today      := OLD.api_calls_today;
    NEW.api_calls_this_month := OLD.api_calls_this_month;
    NEW.api_calls_all_time   := OLD.api_calls_all_time;
    NEW.last_active_date     := OLD.last_active_date;
  END IF;
  RETURN NEW;
END;
$function$;

-- 4. Grant admin role to esakkis7076@gmail.com
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role FROM auth.users WHERE email = 'esakkis7076@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- 5. record_api_call: increments counters, rolls over day/month, returns the row
CREATE OR REPLACE FUNCTION public.record_api_call(_lang text DEFAULT NULL)
RETURNS public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  p public.profiles;
  needs_day_reset boolean;
  needs_month_reset boolean;
BEGIN
  SELECT * INTO p FROM public.profiles WHERE user_id = auth.uid();
  IF NOT FOUND THEN RAISE EXCEPTION 'Profile not found'; END IF;

  needs_day_reset   := p.last_active_date IS NULL OR p.last_active_date::date <> now()::date;
  needs_month_reset := p.last_active_date IS NULL OR date_trunc('month', p.last_active_date) <> date_trunc('month', now());

  UPDATE public.profiles
  SET api_calls_today      = (CASE WHEN needs_day_reset   THEN 0 ELSE api_calls_today END)      + 1,
      api_calls_this_month = (CASE WHEN needs_month_reset THEN 0 ELSE api_calls_this_month END) + 1,
      api_calls_all_time   = api_calls_all_time + 1,
      last_active_date     = now(),
      languages_used       = CASE
                               WHEN _lang IS NULL OR _lang = ANY(languages_used) THEN languages_used
                               ELSE languages_used || _lang
                             END
  WHERE user_id = auth.uid()
  RETURNING * INTO p;

  RETURN p;
END;
$$;

REVOKE ALL ON FUNCTION public.record_api_call(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_api_call(text) TO authenticated;

-- 6. admin_list_users: returns full user table for admins
CREATE OR REPLACE FUNCTION public.admin_list_users()
RETURNS TABLE (
  user_id uuid,
  email text,
  display_name text,
  organisation_name text,
  phone_number text,
  preferred_language text,
  plan_tier text,
  trial_start_date timestamptz,
  trial_end_date timestamptz,
  payment_status text,
  payment_method text,
  utr_reference text,
  admin_notes text,
  api_calls_today integer,
  api_calls_this_month integer,
  api_calls_all_time integer,
  last_active_date timestamptz,
  account_blocked boolean,
  referral_source text,
  manually_upgraded_by text,
  created_at timestamptz
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT app_private.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;
  RETURN QUERY
  SELECT p.user_id, p.email, p.display_name, p.organisation_name, p.phone_number,
         p.preferred_language::text, p.plan_tier, p.trial_start_date, p.trial_end_date,
         p.payment_status, p.payment_method, p.utr_reference, p.admin_notes,
         p.api_calls_today, p.api_calls_this_month, p.api_calls_all_time,
         p.last_active_date, p.account_blocked, p.referral_source, p.manually_upgraded_by,
         p.created_at
  FROM public.profiles p
  ORDER BY p.created_at DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_list_users() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_list_users() TO authenticated;

-- 7. admin_update_user: admin-only update of billing/access fields
CREATE OR REPLACE FUNCTION public.admin_update_user(
  _user_id uuid,
  _plan_tier text DEFAULT NULL,
  _payment_status text DEFAULT NULL,
  _payment_method text DEFAULT NULL,
  _utr_reference text DEFAULT NULL,
  _admin_notes text DEFAULT NULL,
  _account_blocked boolean DEFAULT NULL,
  _trial_end_date timestamptz DEFAULT NULL
)
RETURNS public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  p public.profiles;
  actor_email text;
BEGIN
  IF NOT app_private.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;
  SELECT email INTO actor_email FROM auth.users WHERE id = auth.uid();

  UPDATE public.profiles
  SET plan_tier            = COALESCE(_plan_tier, plan_tier),
      payment_status       = COALESCE(_payment_status, payment_status),
      payment_method       = COALESCE(_payment_method, payment_method),
      utr_reference        = COALESCE(_utr_reference, utr_reference),
      admin_notes          = COALESCE(_admin_notes, admin_notes),
      account_blocked      = COALESCE(_account_blocked, account_blocked),
      trial_end_date       = COALESCE(_trial_end_date, trial_end_date),
      manually_upgraded_by = CASE WHEN _plan_tier IS NOT NULL THEN actor_email ELSE manually_upgraded_by END
  WHERE user_id = _user_id
  RETURNING * INTO p;

  IF NOT FOUND THEN RAISE EXCEPTION 'User not found'; END IF;
  RETURN p;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_update_user(uuid, text, text, text, text, text, boolean, timestamptz) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_update_user(uuid, text, text, text, text, text, boolean, timestamptz) TO authenticated;

-- 8. admin_summary_metrics: dashboard cards
CREATE OR REPLACE FUNCTION public.admin_summary_metrics()
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  IF NOT app_private.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;
  SELECT jsonb_build_object(
    'total_signups', (SELECT count(*) FROM public.profiles),
    'active_trials', (SELECT count(*) FROM public.profiles WHERE plan_tier = 'trial' AND trial_end_date > now()),
    'paying_users',  (SELECT count(*) FROM public.profiles WHERE payment_status = 'paid'),
    'api_calls_today', (SELECT COALESCE(SUM(api_calls_today),0) FROM public.profiles WHERE last_active_date::date = now()::date)
  ) INTO result;
  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_summary_metrics() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_summary_metrics() TO authenticated;

-- 9. Update handle_new_user to capture metadata + set trial dates
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (
    user_id, email, display_name,
    organisation_name, phone_number, referral_source,
    trial_start_date, trial_end_date, plan_tier
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)),
    NEW.raw_user_meta_data->>'organisation_name',
    NEW.raw_user_meta_data->>'phone_number',
    NEW.raw_user_meta_data->>'referral_source',
    now(),
    now() + interval '14 days',
    'trial'
  );
  RETURN NEW;
END;
$function$;
