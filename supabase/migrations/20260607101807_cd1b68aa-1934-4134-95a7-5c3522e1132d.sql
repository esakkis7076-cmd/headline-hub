
CREATE TABLE public.competitor_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  publication_id uuid NOT NULL REFERENCES public.publications(id) ON DELETE CASCADE,
  created_by uuid NOT NULL,
  domain text NOT NULL,
  headlines_collected int NOT NULL DEFAULT 0,
  category_counts jsonb NOT NULL DEFAULT '{}'::jsonb,
  length_buckets jsonb NOT NULL DEFAULT '{}'::jsonb,
  top_patterns jsonb NOT NULL DEFAULT '[]'::jsonb,
  emotional_triggers jsonb NOT NULL DEFAULT '[]'::jsonb,
  sample_headlines jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.competitor_reports TO authenticated;
GRANT ALL ON public.competitor_reports TO service_role;

ALTER TABLE public.competitor_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can read competitor reports for their publication"
  ON public.competitor_reports FOR SELECT TO authenticated
  USING (publication_id = public.current_user_publication());

CREATE POLICY "Members can insert competitor reports for their publication"
  ON public.competitor_reports FOR INSERT TO authenticated
  WITH CHECK (publication_id = public.current_user_publication() AND created_by = auth.uid());

CREATE POLICY "Creators can delete their competitor reports"
  ON public.competitor_reports FOR DELETE TO authenticated
  USING (created_by = auth.uid());

CREATE INDEX idx_competitor_reports_pub_created ON public.competitor_reports(publication_id, created_at DESC);
CREATE INDEX idx_competitor_reports_pub_domain ON public.competitor_reports(publication_id, domain, created_at DESC);
