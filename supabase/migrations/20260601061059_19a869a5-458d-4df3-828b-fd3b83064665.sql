-- RLS policies call these helper functions while evaluating signed-in user access.
-- Without EXECUTE, legitimate authenticated requests can fail with permission errors.
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_user_publication() TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;
GRANT EXECUTE ON FUNCTION public.current_user_publication() TO service_role;