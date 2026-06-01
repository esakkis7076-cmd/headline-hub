REVOKE ALL ON public.profiles FROM anon;
REVOKE ALL ON public.publications FROM anon;
REVOKE ALL ON public.headline_tests FROM anon;
REVOKE ALL ON public.headline_variants FROM anon;
REVOKE ALL ON public.aeo_analyses FROM anon;
REVOKE ALL ON public.user_roles FROM anon;
REVOKE ALL ON public.waitlist_signups FROM anon;

GRANT INSERT ON public.waitlist_signups TO anon;

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.publications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.headline_tests TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.headline_variants TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.aeo_analyses TO authenticated;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT SELECT, INSERT ON public.waitlist_signups TO authenticated;

GRANT ALL ON public.profiles TO service_role;
GRANT ALL ON public.publications TO service_role;
GRANT ALL ON public.headline_tests TO service_role;
GRANT ALL ON public.headline_variants TO service_role;
GRANT ALL ON public.aeo_analyses TO service_role;
GRANT ALL ON public.user_roles TO service_role;
GRANT ALL ON public.waitlist_signups TO service_role;