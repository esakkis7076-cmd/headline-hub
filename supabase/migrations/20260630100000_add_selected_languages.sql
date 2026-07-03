ALTER TABLE public.profiles 
ADD COLUMN selected_languages public.indic_language[] DEFAULT NULL;

COMMENT ON COLUMN public.profiles.selected_languages IS 'Array of languages selected by the user for headline generation and AEO analysis';