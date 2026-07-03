CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name, selected_languages)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    CASE
      WHEN NEW.raw_user_meta_data ? 'selected_languages'
      THEN ARRAY(
        SELECT jsonb_array_elements_text(NEW.raw_user_meta_data->'selected_languages')::public.indic_language
      )
      ELSE NULL
    END
  );

  RETURN NEW;
END;
$$;