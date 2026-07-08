DROP FUNCTION IF EXISTS public.admin_list_users();

CREATE OR REPLACE FUNCTION public.admin_list_users()
RETURNS TABLE (
  user_id uuid,
  email text,
  display_name text,
  organisation_name text,
  phone_number text,
  preferred_language text,
  selected_languages text[],
  plan_tier text,
  trial_start_date timestamptz,
  trial_end_date timestamptz,
  plan_start_date timestamptz,
  plan_end_date timestamptz,
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
         p.preferred_language::text,
         CASE WHEN p.selected_languages IS NULL THEN NULL ELSE ARRAY(SELECT lang::text FROM unnest(p.selected_languages) AS lang) END,
         p.plan_tier,
         p.trial_start_date, p.trial_end_date, p.plan_start_date, p.plan_end_date,
         p.payment_status, p.payment_method, p.utr_reference, p.admin_notes,
         p.api_calls_today, p.api_calls_this_month, p.api_calls_all_time,
         p.last_active_date, p.account_blocked, p.referral_source,
         p.manually_upgraded_by, p.created_at
  FROM public.profiles p
  ORDER BY p.created_at DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_list_users() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_list_users() TO authenticated;

DROP FUNCTION IF EXISTS public.admin_update_user(uuid, text, text, text, text, text, boolean, timestamptz, timestamptz, timestamptz, timestamptz);
DROP FUNCTION IF EXISTS public.admin_update_user(uuid, text, text, text, text, text, boolean, text[], timestamptz, timestamptz, timestamptz, timestamptz);

CREATE OR REPLACE FUNCTION public.admin_update_user(
  _user_id uuid,
  _plan_tier text DEFAULT NULL,
  _payment_status text DEFAULT NULL,
  _payment_method text DEFAULT NULL,
  _utr_reference text DEFAULT NULL,
  _admin_notes text DEFAULT NULL,
  _account_blocked boolean DEFAULT NULL,
  _selected_languages text[] DEFAULT NULL,
  _trial_start_date timestamptz DEFAULT NULL,
  _trial_end_date timestamptz DEFAULT NULL,
  _plan_start_date timestamptz DEFAULT NULL,
  _plan_end_date timestamptz DEFAULT NULL
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

  IF _selected_languages IS NOT NULL THEN
    IF array_length(_selected_languages, 1) IS NULL OR array_length(_selected_languages, 1) < 1 THEN
      RAISE EXCEPTION 'At least one language is required';
    END IF;
    IF array_length(_selected_languages, 1) > 10 THEN
      RAISE EXCEPTION 'A maximum of 10 languages is allowed';
    END IF;
  END IF;

  SELECT email INTO actor_email FROM auth.users WHERE id = auth.uid();

  UPDATE public.profiles
  SET plan_tier            = COALESCE(_plan_tier, plan_tier),
      payment_status       = COALESCE(_payment_status, payment_status),
      payment_method       = COALESCE(_payment_method, payment_method),
      utr_reference        = COALESCE(_utr_reference, utr_reference),
      admin_notes          = COALESCE(_admin_notes, admin_notes),
      account_blocked      = COALESCE(_account_blocked, account_blocked),
      selected_languages   = CASE
                               WHEN _selected_languages IS NOT NULL THEN _selected_languages::public.indic_language[]
                               ELSE selected_languages
                             END,
      preferred_language   = CASE
                               WHEN _selected_languages IS NOT NULL
                                 AND NOT preferred_language::text = ANY(_selected_languages)
                                 THEN _selected_languages[1]::public.indic_language
                               ELSE preferred_language
                             END,
      trial_start_date     = COALESCE(_trial_start_date, trial_start_date),
      trial_end_date       = COALESCE(_trial_end_date, trial_end_date),
      plan_start_date      = CASE
                               WHEN _plan_start_date IS NOT NULL THEN _plan_start_date
                               WHEN _plan_tier IN ('starter','growth','enterprise')
                                 AND plan_tier IS DISTINCT FROM _plan_tier THEN now()
                               ELSE plan_start_date
                             END,
      plan_end_date        = CASE
                               WHEN _plan_end_date IS NOT NULL THEN _plan_end_date
                               WHEN _plan_tier IN ('starter','growth','enterprise')
                                 AND plan_tier IS DISTINCT FROM _plan_tier
                                 THEN COALESCE(_plan_start_date, now()) + interval '1 month'
                               ELSE plan_end_date
                             END,
      manually_upgraded_by = CASE WHEN _plan_tier IS NOT NULL THEN actor_email ELSE manually_upgraded_by END
  WHERE user_id = _user_id
  RETURNING * INTO p;

  IF NOT FOUND THEN RAISE EXCEPTION 'User not found'; END IF;
  RETURN p;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_update_user(uuid, text, text, text, text, text, boolean, text[], timestamptz, timestamptz, timestamptz, timestamptz) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_update_user(uuid, text, text, text, text, text, boolean, text[], timestamptz, timestamptz, timestamptz, timestamptz) TO authenticated;
