import { useEffect, useState } from "react";

type Variant = {
  text: string;
  font: string;
  ctr: number;
  label: string;
  lang: string;
};

type ArticleSet = {
  section: string;
  variants: Variant[];
};

const SETS: ArticleSet[] = [
  {
    section: "Politics · हिन्दी",
    variants: [
      { text: "बजट 2026: FM ने टैक्स राहत की घोषणा की", font: "font-hi", ctr: 7.2, label: "Original", lang: "Factual" },
      { text: "बजट में बंपर तोहफा! जानिए कितने बचेंगे आपके पैसे", font: "font-hi", ctr: 11.8, label: "Variant B", lang: "Emotional" },
      { text: "₹12 लाख तक की आय पर अब ZERO टैक्स — पूरा कैलकुलेशन", font: "font-hi", ctr: 9.1, label: "Variant C", lang: "Number" },
    ],
  },
  {
    section: "Local · தமிழ்",
    variants: [
      { text: "சென்னை மெட்ரோ இரண்டாம் கட்டம்: 118 கி.மீ புதிய பாதை", font: "font-ta", ctr: 7.0, label: "Original", lang: "Factual" },
      { text: "உங்கள் பகுதிக்கு மெட்ரோ வருகிறது! முழு வரைபடம் இங்கே", font: "font-ta", ctr: 12.0, label: "Variant B", lang: "Question" },
    ],
  },
  {
    section: "Entertainment · ಕನ್ನಡ",
    variants: [
      { text: "ಹೊಸ ಕನ್ನಡ ಚಲನಚಿತ್ರ ಬಿಡುಗಡೆ ದಿನಾಂಕ ಪ್ರಕಟ", font: "font-kn", ctr: 7.0, label: "Original", lang: "Factual" },
      { text: "ಫ್ಯಾನ್ಸ್ ಹುಚ್ಚೆದ್ದರು! ಈ ಸಿನಿಮಾ ಎಲ್ಲಾ ರೆಕಾರ್ಡ್ ಮುರಿಯುತ್ತಾ?", font: "font-kn", ctr: 14.0, label: "Variant B", lang: "Emotional" },
    ],
  },
  {
    section: "Politics · తెలుగు",
    variants: [
      { text: "తెలంగాణ ప్రభుత్వం కొత్త విధానం ప్రకటించింది", font: "font-te", ctr: 7.0, label: "Original", lang: "Factual" },
      { text: "బ్రేకింగ్: తెలంగాణలో భారీ మార్పు — మీకు ఎంత లాభం?", font: "font-te", ctr: 11.0, label: "Variant B", lang: "Breaking" },
    ],
  },
];

export function LiveDemoWidget() {
  const [setIndex, setSetIndex] = useState(0);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1200);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setSetIndex((i) => (i + 1) % SETS.length), 7000);
    return () => clearInterval(id);
  }, []);

  const set = SETS[setIndex];
  const best = Math.max(...set.variants.map((v) => v.ctr));

  return (
    <div className="relative rounded-2xl border border-border bg-card p-1.5 shadow-2xl glow-primary">
      <div className="rounded-xl border border-border/80 bg-background/80 p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative inline-flex h-2.5 w-2.5">
              <span className="absolute inset-0 animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
            </span>
            <span className="text-xs font-medium uppercase tracking-wider text-primary">
              Live test
            </span>
            <span className="text-xs text-dim">·</span>
            <span className="text-xs text-muted-foreground">{set.section}</span>
          </div>
          <div className="font-mono text-[10px] text-dim">test_id · tk_{(tick % 9999).toString().padStart(4, "0")}</div>
        </div>

        <div className="space-y-2.5">
          {set.variants.map((v, i) => {
            const isWinner = v.ctr === best;
            const pct = (v.ctr / best) * 100;
            return (
              <div
                key={i}
                className={`relative overflow-hidden rounded-lg border p-3.5 transition ${
                  isWinner
                    ? "border-primary/50 bg-primary/[0.06]"
                    : "border-border bg-surface"
                }`}
              >
                <div
                  className={`absolute inset-y-0 left-0 ${
                    isWinner ? "bg-primary/15" : "bg-muted/40"
                  }`}
                  style={{ width: `${pct}%`, transition: "width 800ms ease" }}
                />
                <div className="relative flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2 text-[10px] uppercase tracking-wider">
                      <span className="text-dim">{v.label}</span>
                      <span className="rounded bg-muted px-1.5 py-px text-muted-foreground">
                        {v.lang}
                      </span>
                      {isWinner && (
                        <span className="rounded bg-primary/20 px-1.5 py-px font-semibold text-primary">
                          ★ Winning
                        </span>
                      )}
                    </div>
                    <div className={`${v.font} text-[15px] leading-snug text-foreground`}>
                      {v.text}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div
                      className={`font-mono text-lg font-semibold tabular-nums ${
                        isWinner ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      {v.ctr.toFixed(1)}%
                    </div>
                    <div className="text-[10px] text-dim">CTR</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-[11px]">
          <span className="text-muted-foreground">
            Thompson Sampling · traffic shifting to winner
          </span>
          <span className="font-mono text-primary">
            +{(((best - set.variants[0].ctr) / set.variants[0].ctr) * 100).toFixed(0)}% vs original
          </span>
        </div>
      </div>
    </div>
  );
}
