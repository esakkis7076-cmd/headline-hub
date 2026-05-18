import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/marketing/SiteNav";
import { LiveDemoWidget } from "@/components/marketing/LiveDemoWidget";
import { FAQ } from "@/components/marketing/FAQ";
import { TKLogo } from "@/components/marketing/TKLogo";

export const Route = createFileRoute("/")({
  component: Landing,
});

const LANGUAGES = [
  { native: "हिन्दी", name: "Hindi", code: "hi", font: "font-hi" },
  { native: "தமிழ்", name: "Tamil", code: "ta", font: "font-ta" },
  { native: "తెలుగు", name: "Telugu", code: "te", font: "font-te" },
  { native: "ಕನ್ನಡ", name: "Kannada", code: "kn", font: "font-kn" },
  { native: "বাংলা", name: "Bengali", code: "bn", font: "font-bn" },
  { native: "मराठी", name: "Marathi", code: "mr", font: "font-mr" },
  { native: "മലയാളം", name: "Malayalam", code: "ml", font: "font-ml" },
  { native: "ગુજરાતી", name: "Gujarati", code: "gu", font: "font-gu" },
  { native: "English", name: "English", code: "en", font: "" },
];

const SECTION_DATA = [
  { section: "Politics", style: "Question", ctr: 11.2, pct: 78 },
  { section: "Sports", style: "Emotional", ctr: 13.5, pct: 94 },
  { section: "Entertainment", style: "Emotional", ctr: 14.8, pct: 100 },
  { section: "Business", style: "Number", ctr: 11.4, pct: 79 },
  { section: "Crime", style: "Breaking", ctr: 13.2, pct: 92 },
];

const STEPS = [
  { n: "01", t: "Publish in your CMS as usual", d: "Nothing changes in your editorial workflow. Article goes live with its CMS headline." },
  { n: "02", t: "Add 2-4 alternative headlines", d: "Open TestKaro, paste the URL, write variants in your language, pick a style for each." },
  { n: "03", t: "We swap headline links on listing pages", d: "Different visitors see different versions of the link on your homepage, section pages, and 'Read more' modules." },
  { n: "04", t: "Track clicks AND Quality Clicks", d: "Quality Click = reader stays 15+ seconds. Catches clickbait. Measures real engagement." },
  { n: "05", t: "Winner found → push to CMS", d: "Update the CMS once. Google Search, Discover, social previews, and RSS all pick up the better headline automatically." },
];

const PRICING = [
  {
    name: "Starter",
    price: "₹5,000",
    cadence: "/month",
    blurb: "For single-language newsrooms getting started.",
    features: ["2 languages", "50 tests / month", "Basic analytics", "Quality Click tracking", "Email support"],
    cta: "Start free trial",
    highlight: false,
  },
  {
    name: "Growth",
    price: "₹12,000",
    cadence: "/month",
    blurb: "Most popular for regional and national publishers.",
    features: ["5 languages", "200 tests / month", "Section analytics", "AI suggestions from your data", "AEO optimizer", "Device segmentation", "Priority support"],
    cta: "Start free trial",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "₹30,000",
    cadence: "/month",
    blurb: "For multi-site, multi-language publishing groups.",
    features: ["All 9 languages", "Unlimited tests", "API access", "Multi-site dashboard", "Custom integrations", "Dedicated CSM"],
    cta: "Talk to sales",
    highlight: false,
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />

      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div
          className="absolute -top-40 left-1/2 h-[520px] w-[920px] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
          style={{ background: "radial-gradient(closest-side, oklch(0.72 0.17 158 / 0.55), transparent)" }}
        />
        <div className="relative mx-auto grid max-w-7xl gap-14 px-5 py-20 md:py-28 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span className="text-muted-foreground">Built for Indian language newsrooms</span>
            </div>
            <h1 className="mt-6 font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
              Your homepage. <br />
              <span className="text-gradient-primary">Better headlines.</span>
              <br />
              More clicks.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Test which headline gets the most clicks on your homepage — in{" "}
              <span className="font-hi text-foreground">हिन्दी</span>,{" "}
              <span className="font-ta text-foreground">தமிழ்</span>,{" "}
              <span className="font-te text-foreground">తెలుగు</span>,{" "}
              <span className="font-kn text-foreground">ಕನ್ನಡ</span>,{" "}
              <span className="font-ml text-foreground">മലയാളം</span>,{" "}
              <span className="font-bn text-foreground">বাংলা</span>,{" "}
              <span className="font-mr text-foreground">मराठी</span>,{" "}
              <span className="font-gu text-foreground">ગુજરાતી</span> & English.
              Find the winner in 2-4 hours.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#waitlist"
                className="rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary-light"
              >
                Start free trial →
              </a>
              <a
                href="#how"
                className="rounded-lg border border-border bg-card/60 px-5 py-3 text-sm font-medium text-foreground transition hover:border-primary/40 hover:bg-card"
              >
                See how it works
              </a>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="text-primary">✓</span> Thompson Sampling bandits
              </div>
              <div className="flex items-center gap-2">
                <span className="text-primary">✓</span> Quality Clicks (15s dwell)
              </div>
              <div className="flex items-center gap-2">
                <span className="text-primary">✓</span> Section-level insights
              </div>
              <div className="flex items-center gap-2">
                <span className="text-primary">✓</span> AEO for AI search
              </div>
            </div>
          </div>

          <div className="lg:pl-4">
            <LiveDemoWidget />
            <p className="mt-3 text-center text-[11px] text-dim">
              Live simulation · Real Hindi, Tamil, Telugu & Kannada headlines from sample tests
            </p>
          </div>
        </div>
      </section>

      {/* ============ LANGUAGES ============ */}
      <section id="languages" className="border-b border-border py-20">
        <div className="mx-auto max-w-7xl px-5">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Native script · Native fonts
            </p>
            <h2 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
              9 Indian languages — <span className="text-gradient-primary">zero competition</span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              Every other A/B tool was built for English. We render Devanagari, Tamil, Telugu, Kannada,
              Bengali, Malayalam and Gujarati the way your editors actually write them.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9">
            {LANGUAGES.map((l) => (
              <div
                key={l.code}
                className="group cursor-default rounded-xl border border-border bg-card p-5 text-center transition hover:-translate-y-0.5 hover:border-primary/40 hover:bg-card/80"
              >
                <div className={`${l.font} text-3xl font-semibold text-foreground transition group-hover:text-primary`}>
                  {l.native}
                </div>
                <div className="mt-2 text-[11px] uppercase tracking-wider text-dim">
                  {l.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section id="how" className="border-b border-border py-24">
        <div className="mx-auto max-w-7xl px-5">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                How it works
              </p>
              <h2 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
                Five steps. <br />
                <span className="text-muted-foreground">Zero workflow change.</span>
              </h2>
              <p className="mt-5 text-muted-foreground">
                Your CMS, your editors, your publishing rhythm — all unchanged.
                TestKaro lives on top of your existing setup as a tiny JS snippet.
              </p>
            </div>
            <ol className="space-y-4">
              {STEPS.map((s) => (
                <li
                  key={s.n}
                  className="group rounded-2xl border border-border bg-card p-6 transition hover:border-primary/40"
                >
                  <div className="flex items-start gap-5">
                    <div className="font-mono text-2xl font-semibold text-primary/70 group-hover:text-primary">
                      {s.n}
                    </div>
                    <div>
                      <h3 className="font-display text-xl font-semibold">{s.t}</h3>
                      <p className="mt-1.5 text-[15px] leading-relaxed text-muted-foreground">
                        {s.d}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ============ DOES / DOESN'T ============ */}
      <section className="border-b border-border bg-surface/40 py-24">
        <div className="mx-auto max-w-7xl px-5">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Honest transparency
            </p>
            <h2 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
              What TestKaro does — and what it doesn't
            </h2>
            <p className="mt-4 text-muted-foreground">
              We refuse to over-promise. Here's exactly what you get and what
              we can't do directly.
            </p>
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-primary/30 bg-primary/[0.04] p-7">
              <h3 className="mb-5 font-display text-xl font-semibold text-primary">
                What it does
              </h3>
              <ul className="space-y-3 text-[15px]">
                {[
                  "Tests headline links on your homepage",
                  "Tests headline links on section pages",
                  "Tests 'Read more' / related-article links",
                  "Tests thumbnail images alongside headlines",
                  "Tracks clicks AND reading engagement (Quality Clicks)",
                  "Finds a statistical winner in 2-4 hours",
                  "Shows which headline STYLE works per section",
                  "AI headline suggestions trained on your past wins",
                  "AEO optimizer for AI search visibility",
                  "Works natively in 9 Indian languages",
                ].map((i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-1 inline-grid h-4 w-4 shrink-0 place-items-center rounded-full bg-primary/20 text-[10px] text-primary">
                      ✓
                    </span>
                    <span className="text-foreground/90">{i}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-border bg-card p-7">
              <h3 className="mb-5 font-display text-xl font-semibold text-destructive">
                What it doesn't
              </h3>
              <ul className="space-y-3 text-[15px]">
                {[
                  "Doesn't change Google Search results directly",
                  "Doesn't change Google Discover headlines",
                  "Doesn't modify the article page's H1 or <title>",
                  "Doesn't work on AMP pages",
                  "Doesn't change social media previews",
                ].map((i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-1 inline-grid h-4 w-4 shrink-0 place-items-center rounded-full bg-destructive/20 text-[10px] text-destructive">
                      ✕
                    </span>
                    <span className="text-muted-foreground">{i}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 rounded-xl border border-primary/30 bg-primary/[0.06] p-4 text-sm leading-relaxed text-foreground/90">
                <span className="font-semibold text-primary">But:</span> the winning
                headline applied to your CMS automatically improves all of the
                above — because Google, social and RSS pull from your source.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ SECTION ANALYTICS PREVIEW ============ */}
      <section id="sections" className="border-b border-border py-24">
        <div className="mx-auto max-w-7xl px-5">
          <div className="grid gap-14 lg:grid-cols-[1fr_1.3fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Section-level learning
              </p>
              <h2 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
                Different sections want <br />
                <span className="text-gradient-primary">different styles.</span>
              </h2>
              <p className="mt-5 text-[15px] leading-relaxed text-muted-foreground">
                Politics readers click questions. Sports readers click emotion.
                Business readers click numbers. TestKaro learns this from YOUR
                newsroom's data — not industry averages.
              </p>
              <div className="mt-6 rounded-xl border border-border bg-card p-4 text-sm">
                <span className="text-dim">→</span>{" "}
                <span className="text-muted-foreground">
                  Recommendation engine improves every week as new tests complete.
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="mb-5 flex items-baseline justify-between">
                <div>
                  <h3 className="font-display text-lg font-semibold">
                    Best headline style by section
                  </h3>
                  <p className="text-xs text-dim">Sample data · 247 completed tests</p>
                </div>
                <span className="rounded bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                  AVG CTR
                </span>
              </div>
              <div className="space-y-3">
                {SECTION_DATA.map((s) => (
                  <div key={s.section}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-foreground">{s.section}</span>
                        <span className="text-dim">·</span>
                        <span className="text-muted-foreground">{s.style}</span>
                      </div>
                      <span className="font-mono font-semibold text-primary">
                        {s.ctr.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary/70 to-primary"
                        style={{ width: `${s.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ POSITIONING ============ */}
      <section className="border-b border-border bg-surface/40 py-24">
        <div className="mx-auto max-w-4xl px-5 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            The strategic insight
          </p>
          <h2 className="mt-4 font-display text-3xl font-semibold leading-[1.2] tracking-tight md:text-4xl">
            Test on your homepage where you have control.
            <br />
            <span className="text-muted-foreground">
              Apply the winner to your CMS. Everything else follows.
            </span>
          </h2>
          <p className="mt-7 text-[17px] leading-relaxed text-muted-foreground">
            Google Search, Discover, social media and RSS all pick up the
            better headline automatically. Human behavior is similar across
            platforms — what wins on the homepage tends to win everywhere.
          </p>
          <div className="mt-10 rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/[0.08] to-transparent p-7 text-left">
            <p className="font-display text-xl leading-relaxed text-foreground">
              "For pay-per-view articles, every headline click is worth real
              money. A 30% better headline means{" "}
              <span className="text-primary">30% more readers</span> hitting the
              paywall."
            </p>
          </div>
        </div>
      </section>

      {/* ============ PRICING ============ */}
      <section id="pricing" className="border-b border-border py-24">
        <div className="mx-auto max-w-7xl px-5">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Pricing
            </p>
            <h2 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
              Built for Indian newsroom budgets
            </h2>
            <p className="mt-4 text-muted-foreground">
              14-day free trial on every plan. No credit card required.
            </p>
          </div>
          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {PRICING.map((p) => (
              <div
                key={p.name}
                className={`relative flex flex-col rounded-2xl border p-7 transition ${
                  p.highlight
                    ? "border-primary/50 bg-gradient-to-b from-primary/[0.08] to-card glow-primary"
                    : "border-border bg-card hover:border-primary/30"
                }`}
              >
                {p.highlight && (
                  <span className="absolute -top-3 left-7 rounded-full bg-primary px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                    Most popular
                  </span>
                )}
                <h3 className="font-display text-2xl font-bold">{p.name}</h3>
                <p className="mt-1 min-h-[40px] text-sm text-muted-foreground">{p.blurb}</p>
                <div className="mt-5 flex items-baseline gap-1">
                  <span className="font-display text-5xl font-bold text-foreground">{p.price}</span>
                  <span className="text-muted-foreground">{p.cadence}</span>
                </div>
                <ul className="mt-7 space-y-2.5 text-sm">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-foreground/90">
                      <span className={`mt-1 text-xs ${p.highlight ? "text-primary" : "text-primary/70"}`}>✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href="#waitlist"
                  className={`mt-8 rounded-lg px-4 py-3 text-center text-sm font-semibold transition ${
                    p.highlight
                      ? "bg-primary text-primary-foreground hover:bg-primary-light"
                      : "border border-border bg-surface text-foreground hover:bg-muted"
                  }`}
                >
                  {p.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section id="faq" className="border-b border-border py-24">
        <div className="mx-auto max-w-3xl px-5">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              FAQ
            </p>
            <h2 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">
              Questions Indian editors ask
            </h2>
          </div>
          <div className="mt-12">
            <FAQ />
          </div>
        </div>
      </section>

      {/* ============ WAITLIST / CTA ============ */}
      <section id="waitlist" className="border-b border-border py-24">
        <div className="mx-auto max-w-3xl px-5">
          <div className="overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/[0.1] via-card to-card p-10 md:p-14 glow-primary">
            <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
              Start your free trial
            </h2>
            <p className="mt-3 text-muted-foreground">
              14 days. Every feature. No credit card. Onboarding call included.
            </p>
            <form
              className="mt-8 grid gap-4 sm:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault();
                alert("Thanks! We'll be in touch within one business day.");
              }}
            >
              <input
                required
                placeholder="Your name"
                className="rounded-lg border border-border bg-background/60 px-4 py-3 text-sm outline-none placeholder:text-dim focus:border-primary"
              />
              <input
                required
                type="email"
                placeholder="Work email"
                className="rounded-lg border border-border bg-background/60 px-4 py-3 text-sm outline-none placeholder:text-dim focus:border-primary"
              />
              <input
                required
                placeholder="Publication name"
                className="rounded-lg border border-border bg-background/60 px-4 py-3 text-sm outline-none placeholder:text-dim focus:border-primary sm:col-span-2"
              />
              <select
                required
                defaultValue=""
                className="rounded-lg border border-border bg-background/60 px-4 py-3 text-sm outline-none focus:border-primary sm:col-span-2"
              >
                <option value="" disabled>Primary language</option>
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>{l.native} — {l.name}</option>
                ))}
              </select>
              <button
                type="submit"
                className="rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary-light sm:col-span-2"
              >
                Start free trial →
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 sm:flex-row">
          <TKLogo />
          <p className="text-xs text-dim">
            © {new Date().getFullYear()} TestKaro. Built for Indian newsrooms.
          </p>
          <div className="flex gap-5 text-xs text-muted-foreground">
            <a href="#pricing" className="hover:text-foreground">Pricing</a>
            <a href="#faq" className="hover:text-foreground">FAQ</a>
            <a href="#waitlist" className="hover:text-foreground">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
