import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TKLogo } from "@/components/marketing/TKLogo";
import { LanguageMultiSelect, type LanguageCode } from "@/components/ui/language-multi-select";
import { ensurePublication } from "@/lib/workspace.functions";

export const Route = createFileRoute("/select-languages")({
  component: SelectLanguagesPage,
  head: () => ({
    meta: [
      { title: "Select Languages — Story Pulse" },
      { name: "description", content: "Select the languages you want to work with for headline testing and AEO analysis." },
    ],
  }),
});

function SelectLanguagesPage() {
  const navigate = useNavigate();
  const ensurePub = useServerFn(ensurePublication);
  const [selectedLanguages, setSelectedLanguages] = useState<LanguageCode[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedLanguages.length === 0) {
      toast.error("Please select at least one language");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Not authenticated");
      }

      const { error } = await supabase
        .from("profiles")
        .upsert(
          {
            user_id: user.id,
            email: user.email ?? null,
            display_name:
              user.user_metadata?.full_name ??
              user.user_metadata?.name ??
              user.email?.split("@")[0] ??
              null,
            selected_languages: selectedLanguages,
          },
          { onConflict: "user_id" },
        );

      if (error) throw error;

      await ensurePub({ data: { default_language: selectedLanguages[0] } });

      toast.success("Languages saved successfully");
      navigate({ to: "/aeo" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save languages");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-8"><TKLogo /></div>
        <div className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur p-8 shadow-2xl">
          <h1 className="font-serif text-3xl font-semibold tracking-tight">
            Select your languages
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Choose the languages you want to work with for headline testing and AEO analysis.
          </p>

          <form onSubmit={handleSubmit} className="mt-6">
            <LanguageMultiSelect
              selected={selectedLanguages}
              onChange={setSelectedLanguages}
              disabled={loading}
            />

            <button
              type="submit"
              disabled={loading || selectedLanguages.length === 0}
              className="mt-6 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition disabled:opacity-50"
            >
              {loading ? "Saving…" : "Continue"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
