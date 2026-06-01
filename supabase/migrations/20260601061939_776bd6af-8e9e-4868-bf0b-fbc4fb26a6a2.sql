CREATE SCHEMA IF NOT EXISTS app_private;
REVOKE ALL ON SCHEMA app_private FROM PUBLIC;
GRANT USAGE ON SCHEMA app_private TO authenticated;
GRANT USAGE ON SCHEMA app_private TO service_role;

CREATE OR REPLACE FUNCTION app_private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION app_private.current_user_publication()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT publication_id
  FROM public.profiles
  WHERE user_id = auth.uid()
  LIMIT 1
$$;

REVOKE ALL ON FUNCTION app_private.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE ALL ON FUNCTION app_private.current_user_publication() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app_private.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION app_private.current_user_publication() TO authenticated;
GRANT EXECUTE ON FUNCTION app_private.has_role(uuid, public.app_role) TO service_role;
GRANT EXECUTE ON FUNCTION app_private.current_user_publication() TO service_role;

DROP POLICY IF EXISTS "Users view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id OR app_private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins manage roles" ON public.user_roles;
CREATE POLICY "Users view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id OR app_private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles
  FOR ALL USING (app_private.has_role(auth.uid(), 'admin'))
  WITH CHECK (app_private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Members view publication" ON public.publications;
DROP POLICY IF EXISTS "Users create own publication" ON public.publications;
DROP POLICY IF EXISTS "Owners update publication" ON public.publications;
DROP POLICY IF EXISTS "Owners delete publication" ON public.publications;
CREATE POLICY "Members view publication" ON public.publications
  FOR SELECT USING (
    id = app_private.current_user_publication()
    OR owner_id = auth.uid()
    OR app_private.has_role(auth.uid(), 'admin')
  );
CREATE POLICY "Users create own publication" ON public.publications
  FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owners update publication" ON public.publications
  FOR UPDATE USING (owner_id = auth.uid() OR app_private.has_role(auth.uid(), 'admin'))
  WITH CHECK (owner_id = auth.uid() OR app_private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Owners delete publication" ON public.publications
  FOR DELETE USING (owner_id = auth.uid() OR app_private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Publication members view tests" ON public.headline_tests;
DROP POLICY IF EXISTS "Publication members create tests" ON public.headline_tests;
DROP POLICY IF EXISTS "Publication members update tests" ON public.headline_tests;
DROP POLICY IF EXISTS "Publication members delete tests" ON public.headline_tests;
CREATE POLICY "Publication members view tests" ON public.headline_tests
  FOR SELECT USING (
    publication_id = app_private.current_user_publication()
    OR app_private.has_role(auth.uid(), 'admin')
  );
CREATE POLICY "Publication members create tests" ON public.headline_tests
  FOR INSERT WITH CHECK (
    publication_id = app_private.current_user_publication() AND created_by = auth.uid()
  );
CREATE POLICY "Publication members update tests" ON public.headline_tests
  FOR UPDATE USING (publication_id = app_private.current_user_publication())
  WITH CHECK (publication_id = app_private.current_user_publication());
CREATE POLICY "Publication members delete tests" ON public.headline_tests
  FOR DELETE USING (publication_id = app_private.current_user_publication());

DROP POLICY IF EXISTS "View variants of own tests" ON public.headline_variants;
DROP POLICY IF EXISTS "Manage variants of own tests" ON public.headline_variants;
CREATE POLICY "View variants of own tests" ON public.headline_variants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.headline_tests t
      WHERE t.id = headline_variants.test_id
        AND (t.publication_id = app_private.current_user_publication()
             OR app_private.has_role(auth.uid(), 'admin'))
    )
  );
CREATE POLICY "Manage variants of own tests" ON public.headline_variants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.headline_tests t
      WHERE t.id = headline_variants.test_id
        AND t.publication_id = app_private.current_user_publication()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.headline_tests t
      WHERE t.id = headline_variants.test_id
        AND t.publication_id = app_private.current_user_publication()
    )
  );

DROP POLICY IF EXISTS "Publication members view aeo" ON public.aeo_analyses;
DROP POLICY IF EXISTS "Publication members create aeo" ON public.aeo_analyses;
DROP POLICY IF EXISTS "Publication members delete aeo" ON public.aeo_analyses;
CREATE POLICY "Publication members view aeo" ON public.aeo_analyses
  FOR SELECT USING (
    publication_id = app_private.current_user_publication()
    OR app_private.has_role(auth.uid(), 'admin')
  );
CREATE POLICY "Publication members create aeo" ON public.aeo_analyses
  FOR INSERT WITH CHECK (
    publication_id = app_private.current_user_publication() AND created_by = auth.uid()
  );
CREATE POLICY "Publication members delete aeo" ON public.aeo_analyses
  FOR DELETE USING (publication_id = app_private.current_user_publication());

DROP POLICY IF EXISTS "Admins read waitlist" ON public.waitlist_signups;
CREATE POLICY "Admins read waitlist" ON public.waitlist_signups
  FOR SELECT USING (app_private.has_role(auth.uid(), 'admin'));

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.current_user_publication() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.current_user_publication() FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.current_user_publication() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM service_role;
REVOKE EXECUTE ON FUNCTION public.current_user_publication() FROM service_role;