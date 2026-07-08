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
    'api_calls_today', (SELECT COALESCE(SUM(api_calls_today), 0) FROM public.profiles WHERE last_active_date::date = now()::date)
  ) INTO result;

  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_summary_metrics() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_summary_metrics() TO authenticated;
