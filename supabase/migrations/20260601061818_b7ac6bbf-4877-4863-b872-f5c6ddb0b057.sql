GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.publications TO authenticated;
GRANT ALL ON public.publications TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.headline_tests TO authenticated;
GRANT ALL ON public.headline_tests TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.headline_variants TO authenticated;
GRANT ALL ON public.headline_variants TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.aeo_analyses TO authenticated;
GRANT ALL ON public.aeo_analyses TO service_role;

GRANT INSERT ON public.waitlist_signups TO anon;
GRANT INSERT ON public.waitlist_signups TO authenticated;
GRANT ALL ON public.waitlist_signups TO service_role;

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_user_publication() TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;
GRANT EXECUTE ON FUNCTION public.current_user_publication() TO service_role;