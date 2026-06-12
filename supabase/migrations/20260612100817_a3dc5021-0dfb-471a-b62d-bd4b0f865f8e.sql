DROP POLICY IF EXISTS "Publication members update aeo" ON public.aeo_analyses;
CREATE POLICY "Publication members update aeo" ON public.aeo_analyses
  FOR UPDATE TO authenticated
  USING (publication_id = app_private.current_user_publication())
  WITH CHECK (publication_id = app_private.current_user_publication());