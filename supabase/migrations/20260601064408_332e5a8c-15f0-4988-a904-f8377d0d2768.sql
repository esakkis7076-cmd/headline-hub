REVOKE ALL ON public.profiles FROM authenticated;
REVOKE ALL ON public.publications FROM authenticated;
REVOKE ALL ON public.headline_tests FROM authenticated;
REVOKE ALL ON public.headline_variants FROM authenticated;
REVOKE ALL ON public.aeo_analyses FROM authenticated;
REVOKE ALL ON public.user_roles FROM authenticated;
REVOKE ALL ON public.waitlist_signups FROM authenticated;

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.publications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.headline_tests TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.headline_variants TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.aeo_analyses TO authenticated;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT SELECT, INSERT ON public.waitlist_signups TO authenticated;