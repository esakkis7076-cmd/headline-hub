
-- 1. Lock down profile.publication_id changes (only admins can change membership)
CREATE OR REPLACE FUNCTION public.prevent_profile_publication_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.publication_id IS DISTINCT FROM OLD.publication_id
     AND NOT app_private.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Changing publication_id is not permitted';
  END IF;
  IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN
    RAISE EXCEPTION 'Changing user_id is not permitted';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_lock_publication ON public.profiles;
CREATE TRIGGER profiles_lock_publication
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_publication_change();

-- 2. Repoint policies that still use public.current_user_publication() to app_private version
DROP POLICY IF EXISTS "Creators can delete their competitor reports" ON public.competitor_reports;
DROP POLICY IF EXISTS "Members can insert competitor reports for their publication" ON public.competitor_reports;
DROP POLICY IF EXISTS "Members can read competitor reports for their publication" ON public.competitor_reports;

CREATE POLICY "Creators can delete their competitor reports"
ON public.competitor_reports FOR DELETE TO authenticated
USING (created_by = auth.uid());

CREATE POLICY "Members can insert competitor reports for their publication"
ON public.competitor_reports FOR INSERT TO authenticated
WITH CHECK (publication_id = app_private.current_user_publication() AND created_by = auth.uid());

CREATE POLICY "Members can read competitor reports for their publication"
ON public.competitor_reports FOR SELECT TO authenticated
USING (publication_id = app_private.current_user_publication());

DROP POLICY IF EXISTS "Creators can delete their content gap reports" ON public.content_gap_reports;
DROP POLICY IF EXISTS "Members can insert content gap reports for their publication" ON public.content_gap_reports;
DROP POLICY IF EXISTS "Members can read content gap reports for their publication" ON public.content_gap_reports;

CREATE POLICY "Creators can delete their content gap reports"
ON public.content_gap_reports FOR DELETE TO authenticated
USING (created_by = auth.uid());

CREATE POLICY "Members can insert content gap reports for their publication"
ON public.content_gap_reports FOR INSERT TO authenticated
WITH CHECK (publication_id = app_private.current_user_publication() AND created_by = auth.uid());

CREATE POLICY "Members can read content gap reports for their publication"
ON public.content_gap_reports FOR SELECT TO authenticated
USING (publication_id = app_private.current_user_publication());

-- 3. Revoke EXECUTE on the duplicate public-schema SECURITY DEFINER helpers
REVOKE ALL ON FUNCTION public.current_user_publication() FROM PUBLIC, authenticated, anon;
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, authenticated, anon;
