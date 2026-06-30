-- Add selected_languages field to profiles table
-- This allows users to select multiple languages they want to work with

ALTER TABLE public.profiles 
ADD COLUMN selected_languages public.indic_language[] DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.selected_languages IS 'Array of languages selected by the user for headline generation and AEO analysis';
