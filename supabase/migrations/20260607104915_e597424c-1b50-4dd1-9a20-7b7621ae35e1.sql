
CREATE TABLE public.content_gap_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  publication_id uuid NOT NULL REFERENCES public.publications(id) ON DELETE CASCADE,
  created_by uuid NOT NULL,
  user_domain text NOT NULL,
  competitor_domain text NOT NULL,
  user_url_count integer NOT NULL DEFAULT 0,
  competitor_url_count integer NOT NULL DEFAULT 0,
  user_topics jsonb NOT NULL DEFAULT '[]'::jsonb,
  competitor_topics jsonb NOT NULL DEFAULT '[]'::jsonb,
  missing_topics jsonb NOT NULL DEFAULT '[]'::jsonb,
  under_covered_topics jsonb NOT NULL DEFAULT '[]'::jsonb,
  recommendations jsonb NOT NULL DEFAULT '[]'::jsonb,
  summary text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_content_gap_pub_created ON public.content_gap_reports(publication_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.content_gap_reports TO authenticated;
GRANT ALL ON public.content_gap_reports TO service_role;

ALTER TABLE public.content_gap_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can read content gap reports for their publication"
  ON public.content_gap_reports FOR SELECT TO authenticated
  USING (publication_id = current_user_publication());

CREATE POLICY "Members can insert content gap reports for their publication"
  ON public.content_gap_reports FOR INSERT TO authenticated
  WITH CHECK (publication_id = current_user_publication() AND created_by = auth.uid());

CREATE POLICY "Creators can delete their content gap reports"
  ON public.content_gap_reports FOR DELETE TO authenticated
  USING (created_by = auth.uid());
