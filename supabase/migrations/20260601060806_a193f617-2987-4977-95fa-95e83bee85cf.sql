-- Restore Data API grants for existing public tables.
-- RLS policies still control which rows each user can access.
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
GRANT SELECT, INSERT, UPDATE, DELETE ON public.waitlist_signups TO service_role;

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

-- Recreate the auth signup trigger that provisions a profile for each new user.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();