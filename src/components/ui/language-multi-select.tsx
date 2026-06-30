import { Check } from "lucide-react";

export const LANGUAGES = [
  { code: "hi", name: "Hindi" },
  { code: "bn", name: "Bengali" },
  { code: "ta", name: "Tamil" },
  { code: "te", name: "Telugu" },
  { code: "mr", name: "Marathi" },
  { code: "gu", name: "Gujarati" },
  { code: "kn", name: "Kannada" },
  { code: "ml", name: "Malayalam" },
  { code: "pa", name: "Punjabi" },
  { code: "en", name: "English" },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["code"];

interface LanguageMultiSelectProps {
  selected: LanguageCode[];
  onChange: (selected: LanguageCode[]) => void;
  disabled?: boolean;
}

export function LanguageMultiSelect({
  selected,
  onChange,
  disabled = false,
}: LanguageMultiSelectProps) {
  const toggleLanguage = (code: LanguageCode) => {
    if (selected.includes(code)) {
      onChange(selected.filter((c) => c !== code));
    } else {
      onChange([...selected, code]);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        Select languages you want to work with
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {LANGUAGES.map((lang) => {
          const isSelected = selected.includes(lang.code);
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => toggleLanguage(lang.code)}
              disabled={disabled}
              className={`
                flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm transition
                ${
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-border hover:bg-accent"
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              {isSelected && <Check size={14} />}
              <span className={isSelected ? "" : "ml-5"}>{lang.name}</span>
            </button>
          );
        })}
      </div>
      {selected.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {selected.length} language{selected.length !== 1 ? "s" : ""} selected
        </p>
      )}
    </div>
  );
}
