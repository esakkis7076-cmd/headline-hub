GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT USAGE ON SCHEMA app_private TO authenticated, service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.publications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.headline_tests TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.headline_variants TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.aeo_analyses TO authenticated;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT INSERT ON public.waitlist_signups TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.waitlist_signups TO service_role;

GRANT ALL ON public.profiles TO service_role;
GRANT ALL ON public.publications TO service_role;
GRANT ALL ON public.headline_tests TO service_role;
GRANT ALL ON public.headline_variants TO service_role;
GRANT ALL ON public.aeo_analyses TO service_role;
GRANT ALL ON public.user_roles TO service_role;

GRANT EXECUTE ON FUNCTION app_private.current_user_publication() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION app_private.has_role(uuid, app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();