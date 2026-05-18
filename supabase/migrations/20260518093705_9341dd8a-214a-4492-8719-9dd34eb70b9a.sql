
-- =========================
-- ENUMS
-- =========================
CREATE TYPE public.app_role AS ENUM ('admin', 'editor', 'viewer');
CREATE TYPE public.test_status AS ENUM ('draft', 'running', 'completed', 'archived');
CREATE TYPE public.indic_language AS ENUM ('hi','bn','ta','te','mr','gu','kn','ml','pa','en');

-- =========================
-- Shared trigger
-- =========================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- =========================
-- publications
-- =========================
CREATE TABLE public.publications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  domain TEXT,
  default_language public.indic_language NOT NULL DEFAULT 'hi',
  owner_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.publications ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_publications_updated BEFORE UPDATE ON public.publications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================
-- profiles
-- =========================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  display_name TEXT,
  email TEXT,
  publication_id UUID REFERENCES public.publications(id) ON DELETE SET NULL,
  preferred_language public.indic_language NOT NULL DEFAULT 'hi',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================
-- user_roles (separate table for security)
-- =========================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.current_user_publication()
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT publication_id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1
$$;

-- =========================
-- headline_tests
-- =========================
CREATE TABLE public.headline_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publication_id UUID NOT NULL REFERENCES public.publications(id) ON DELETE CASCADE,
  created_by UUID NOT NULL,
  article_url TEXT NOT NULL,
  article_title TEXT,
  section TEXT,
  language public.indic_language NOT NULL DEFAULT 'hi',
  status public.test_status NOT NULL DEFAULT 'draft',
  traffic_split JSONB NOT NULL DEFAULT '{}'::jsonb,
  winner_variant_id UUID,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.headline_tests ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_headline_tests_pub ON public.headline_tests(publication_id);
CREATE TRIGGER trg_headline_tests_updated BEFORE UPDATE ON public.headline_tests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================
-- headline_variants
-- =========================
CREATE TABLE public.headline_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES public.headline_tests(id) ON DELETE CASCADE,
  variant_label TEXT NOT NULL,
  headline_text TEXT NOT NULL,
  is_control BOOLEAN NOT NULL DEFAULT false,
  impressions INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  ctr NUMERIC(6,4) NOT NULL DEFAULT 0,
  avg_dwell_time_sec NUMERIC(8,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.headline_variants ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_headline_variants_test ON public.headline_variants(test_id);
CREATE TRIGGER trg_headline_variants_updated BEFORE UPDATE ON public.headline_variants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================
-- aeo_analyses
-- =========================
CREATE TABLE public.aeo_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publication_id UUID NOT NULL REFERENCES public.publications(id) ON DELETE CASCADE,
  created_by UUID NOT NULL,
  article_url TEXT NOT NULL,
  language public.indic_language NOT NULL DEFAULT 'hi',
  overall_score INTEGER,
  position_zero_summary TEXT,
  faq_schema JSONB,
  discover_ready BOOLEAN NOT NULL DEFAULT false,
  discover_checks JSONB,
  raw_response JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.aeo_analyses ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_aeo_pub ON public.aeo_analyses(publication_id);
CREATE TRIGGER trg_aeo_updated BEFORE UPDATE ON public.aeo_analyses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================
-- waitlist_signups
-- =========================
CREATE TABLE public.waitlist_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  publication TEXT,
  role TEXT,
  preferred_language public.indic_language,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.waitlist_signups ENABLE ROW LEVEL SECURITY;

-- =========================
-- RLS POLICIES
-- =========================

-- profiles
CREATE POLICY "Users view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- user_roles
CREATE POLICY "Users view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- publications
CREATE POLICY "Members view publication" ON public.publications
  FOR SELECT USING (
    id = public.current_user_publication()
    OR owner_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
  );
CREATE POLICY "Users create own publication" ON public.publications
  FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owners update publication" ON public.publications
  FOR UPDATE USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Owners delete publication" ON public.publications
  FOR DELETE USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- headline_tests
CREATE POLICY "Publication members view tests" ON public.headline_tests
  FOR SELECT USING (
    publication_id = public.current_user_publication()
    OR public.has_role(auth.uid(), 'admin')
  );
CREATE POLICY "Publication members create tests" ON public.headline_tests
  FOR INSERT WITH CHECK (
    publication_id = public.current_user_publication() AND created_by = auth.uid()
  );
CREATE POLICY "Publication members update tests" ON public.headline_tests
  FOR UPDATE USING (publication_id = public.current_user_publication());
CREATE POLICY "Publication members delete tests" ON public.headline_tests
  FOR DELETE USING (publication_id = public.current_user_publication());

-- headline_variants (scoped via parent test)
CREATE POLICY "View variants of own tests" ON public.headline_variants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.headline_tests t
      WHERE t.id = test_id
        AND (t.publication_id = public.current_user_publication()
             OR public.has_role(auth.uid(), 'admin'))
    )
  );
CREATE POLICY "Manage variants of own tests" ON public.headline_variants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.headline_tests t
      WHERE t.id = test_id
        AND t.publication_id = public.current_user_publication()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.headline_tests t
      WHERE t.id = test_id
        AND t.publication_id = public.current_user_publication()
    )
  );

-- aeo_analyses
CREATE POLICY "Publication members view aeo" ON public.aeo_analyses
  FOR SELECT USING (
    publication_id = public.current_user_publication()
    OR public.has_role(auth.uid(), 'admin')
  );
CREATE POLICY "Publication members create aeo" ON public.aeo_analyses
  FOR INSERT WITH CHECK (
    publication_id = public.current_user_publication() AND created_by = auth.uid()
  );
CREATE POLICY "Publication members delete aeo" ON public.aeo_analyses
  FOR DELETE USING (publication_id = public.current_user_publication());

-- waitlist_signups (public insert, admin read)
CREATE POLICY "Anyone can join waitlist" ON public.waitlist_signups
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins read waitlist" ON public.waitlist_signups
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- =========================
-- New user trigger: auto-create profile
-- =========================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1))
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
