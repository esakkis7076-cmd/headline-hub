import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Sparkles, Zap, Target, Brain, Search, TrendingUp, BarChart3, Eye, Copy, Heart,
  Wand2, Gauge, Lightbulb, Type, Trophy, MessageSquare, Check, X, ArrowRight,
  Play, Star, ChevronDown, Globe, Users, Newspaper, ShoppingBag, Rocket, Megaphone,
  Twitter, Linkedin, Github, Mail, Layers,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Instrument+Serif:ital@0;1&display=swap",
      },
      { rel: "canonical", href: "https://headline-suggest.lovable.app/" },
    ],
    meta: [
      { title: "Headline Suggest — AI Headlines That Rank, Get Clicked & Get Cited by AI" },
      { name: "description", content: "AI-powered headline intelligence. Optimize for Google Search, AI Overviews, ChatGPT, Gemini, Claude & Perplexity. SEO + AEO + CTR scoring in seconds." },
      { property: "og:title", content: "Headline Suggest — AI Headline Intelligence" },
      { property: "og:description", content: "Headlines that rank, get clicked, and get cited by AI. SEO + AEO + CTR scoring." },
      { property: "og:url", content: "https://headline-suggest.lovable.app/" },
      { property: "og:type", content: "website" },
    ],
  }),
});

/* ------------------------------- shared bits ------------------------------- */

const BRAND = {
  primary: "#6C4DF6",
  secondary: "#4F46E5",
  accent: "#00C2FF",
};

function Section({ id, className = "", children }: { id?: string; className?: string; children: React.ReactNode }) {
  return (
    <section id={id} className={`relative mx-auto w-full max-w-7xl px-6 py-24 sm:py-28 ${className}`}>
      {children}
    </section>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[#6C4DF6]/20 bg-white/70 px-3.5 py-1.5 text-xs font-medium text-[#4F46E5] shadow-sm backdrop-blur">
      {children}
    </span>
  );
}

function GradientText({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="bg-clip-text text-transparent"
      style={{ backgroundImage: `linear-gradient(120deg, ${BRAND.primary} 0%, ${BRAND.secondary} 45%, ${BRAND.accent} 100%)` }}
    >
      {children}
    </span>
  );
}

function GlassCard({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={`rounded-2xl border border-white/60 bg-white/60 shadow-[0_8px_40px_-12px_rgba(76,70,229,0.18)] backdrop-blur-xl ${className}`}
    >
      {children}
    </div>
  );
}

/* --------------------------------- page ----------------------------------- */

function Landing() {
  // Reveal-on-scroll
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>("[data-reveal]");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-revealed");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="hs-root min-h-screen bg-white text-[#0B0B14] antialiased">
      <PageStyles />
      <BackgroundDecor />
      <Nav />
      <Hero />
      <Trust />
      <Problem />
      <Solution />
      <Features />
      <HowItWorks />
      <Demo />
      <Performance />
      <Comparison />
      <UseCases />
      <Testimonials />
      <Pricing />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
}

/* --------------------------------- styles --------------------------------- */

function PageStyles() {
  return (
    <style>{`
      .hs-root { font-family: 'Inter', system-ui, -apple-system, sans-serif; color: #0B0B14; }
      .hs-root .font-display { font-family: 'Instrument Serif', 'Inter', serif; letter-spacing: -0.02em; }
      [data-reveal] { opacity: 0; transform: translateY(24px); transition: opacity .8s cubic-bezier(.2,.7,.2,1), transform .8s cubic-bezier(.2,.7,.2,1); }
      [data-reveal].is-revealed { opacity: 1; transform: none; }
      [data-reveal-delay="1"] { transition-delay: .08s; }
      [data-reveal-delay="2"] { transition-delay: .16s; }
      [data-reveal-delay="3"] { transition-delay: .24s; }
      [data-reveal-delay="4"] { transition-delay: .32s; }
      [data-reveal-delay="5"] { transition-delay: .40s; }

      @keyframes hs-blob { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(40px,-30px) scale(1.08)} 66%{transform:translate(-30px,20px) scale(.95)} }
      .hs-blob { animation: hs-blob 18s ease-in-out infinite; will-change: transform; }
      .hs-blob.b2 { animation-duration: 22s; animation-delay: -6s; }
      .hs-blob.b3 { animation-duration: 26s; animation-delay: -12s; }

      @keyframes hs-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
      .hs-float { animation: hs-float 6s ease-in-out infinite; }
      .hs-float.d1 { animation-delay: -1.5s; }
      .hs-float.d2 { animation-delay: -3s; }
      .hs-float.d3 { animation-delay: -4.5s; }

      @keyframes hs-shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
      .hs-shimmer { background: linear-gradient(90deg, rgba(108,77,246,0) 0%, rgba(108,77,246,.25) 50%, rgba(108,77,246,0) 100%); background-size: 200% 100%; animation: hs-shimmer 2.4s linear infinite; }

      @keyframes hs-ring { 0%{stroke-dashoffset: var(--hs-len)} 100%{stroke-dashoffset: var(--hs-end)} }
      .hs-grid-bg {
        background-image:
          linear-gradient(to right, rgba(11,11,20,.06) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(11,11,20,.06) 1px, transparent 1px);
        background-size: 56px 56px;
        mask-image: radial-gradient(ellipse at center, black 40%, transparent 75%);
      }
      .hs-card-hover { transition: transform .35s cubic-bezier(.2,.7,.2,1), box-shadow .35s ease, border-color .35s ease; }
      .hs-card-hover:hover { transform: translateY(-4px); box-shadow: 0 24px 60px -22px rgba(76,70,229,.35); border-color: rgba(108,77,246,.35); }

      .hs-underline-link { position: relative; }
      .hs-underline-link::after { content:''; position:absolute; left:0; right:0; bottom:-2px; height:1px; background: currentColor; transform: scaleX(0); transform-origin: right; transition: transform .35s ease; }
      .hs-underline-link:hover::after { transform: scaleX(1); transform-origin: left; }
    `}</style>
  );
}

function BackgroundDecor() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="hs-blob absolute -top-40 -left-32 h-[520px] w-[520px] rounded-full opacity-50 blur-3xl"
        style={{ background: `radial-gradient(circle at 30% 30%, ${BRAND.primary}55, transparent 70%)` }}
      />
      <div
        className="hs-blob b2 absolute top-[20%] -right-32 h-[560px] w-[560px] rounded-full opacity-50 blur-3xl"
        style={{ background: `radial-gradient(circle at 50% 50%, ${BRAND.accent}40, transparent 70%)` }}
      />
      <div
        className="hs-blob b3 absolute bottom-[-10%] left-[30%] h-[480px] w-[480px] rounded-full opacity-40 blur-3xl"
        style={{ background: `radial-gradient(circle at 50% 50%, ${BRAND.secondary}40, transparent 70%)` }}
      />
    </div>
  );
}

/* ----------------------------------- Nav ---------------------------------- */

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const links = [
    ["Features", "#features"],
    ["How It Works", "#how"],
    ["Solutions", "#use-cases"],
    ["Pricing", "#pricing"],
    ["FAQ", "#faq"],
    ["Blog", "#"],
  ];
  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "border-b border-black/5 bg-white/70 backdrop-blur-xl" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <a href="#top" className="flex items-center gap-2">
          <div
            className="grid h-8 w-8 place-items-center rounded-xl text-white shadow-md"
            style={{ background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.accent})` }}
          >
            <Sparkles size={16} />
          </div>
          <span className="text-[15px] font-semibold tracking-tight">Headline Suggest</span>
        </a>
        <nav className="hidden items-center gap-7 text-sm text-[#4a4a55] md:flex">
          {links.map(([label, href]) => (
            <a key={label} href={href} className="hs-underline-link hover:text-[#0B0B14]">
              {label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/login" className="hidden text-sm font-medium text-[#4a4a55] hover:text-[#0B0B14] sm:inline">
            Sign in
          </Link>
          <Link
            to="/login"
            className="group relative inline-flex items-center gap-1.5 overflow-hidden rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgba(108,77,246,0.6)] transition hover:shadow-[0_12px_30px_-8px_rgba(108,77,246,0.8)]"
            style={{ background: `linear-gradient(120deg, ${BRAND.primary}, ${BRAND.secondary})` }}
          >
            Generate Free Headlines
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ---------------------------------- Hero ---------------------------------- */

function Hero() {
  return (
    <div id="top" className="relative">
      <div className="hs-grid-bg absolute inset-0 -z-10" />
      <Section className="!py-20 sm:!py-28">
        <div className="grid items-center gap-16 lg:grid-cols-[1.05fr_1fr]">
          <div data-reveal>
            <Pill>
              <Rocket size={12} /> Built for Google AI, ChatGPT, Gemini & Perplexity
            </Pill>
            <h1 className="mt-6 font-display text-5xl leading-[1.02] tracking-tight sm:text-6xl lg:text-[80px]">
              Stop guessing headlines.
              <br />
              <GradientText>
                <em className="not-italic">Create headlines</em>
              </GradientText>{" "}
              that rank, get clicked, and get cited by AI.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#4a4a55]">
              Headline Suggest analyzes your content, audience intent, search behavior, SEO signals, and AI visibility
              to create headlines that drive more clicks and increase discoverability across Google Search, AI Overviews,
              ChatGPT, Gemini, Claude, and Perplexity.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/login"
                className="group inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_32px_-10px_rgba(108,77,246,0.7)] transition hover:shadow-[0_16px_40px_-10px_rgba(108,77,246,0.9)]"
                style={{ background: `linear-gradient(120deg, ${BRAND.primary}, ${BRAND.secondary})` }}
              >
                Generate Free Headlines
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a
                href="#demo"
                className="inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white/80 px-5 py-3 text-sm font-semibold text-[#0B0B14] backdrop-blur hover:bg-white"
              >
                <Play size={14} /> Watch Live Demo
              </a>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#6b6b7a]">
              <span className="inline-flex items-center gap-1.5"><Check size={14} className="text-emerald-500" /> No credit card</span>
              <span className="inline-flex items-center gap-1.5"><Check size={14} className="text-emerald-500" /> 14-day free trial</span>
              <span className="inline-flex items-center gap-1.5"><Check size={14} className="text-emerald-500" /> Cancel anytime</span>
            </div>
          </div>
          <div data-reveal data-reveal-delay="2" className="relative">
            <HeroDashboard />
          </div>
        </div>
      </Section>
    </div>
  );
}

function HeroDashboard() {
  return (
    <div className="relative mx-auto w-full max-w-xl">
      {/* Floating metric chips */}
      <FloatingChip className="-top-4 -left-6 hs-float" icon={<TrendingUp size={14} />} label="CTR +47%" color="#6C4DF6" />
      <FloatingChip className="top-8 -right-8 hs-float d1" icon={<Brain size={14} />} label="AI Cited" color="#00C2FF" />
      <FloatingChip className="-bottom-4 -left-4 hs-float d2" icon={<Search size={14} />} label="SEO 94" color="#4F46E5" />
      <FloatingChip className="bottom-16 -right-6 hs-float d3" icon={<Eye size={14} />} label="Readable" color="#10b981" />

      <GlassCard className="relative overflow-hidden p-5">
        <div className="flex items-center justify-between text-xs text-[#6b6b7a]">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            <span className="ml-2">headlinesuggest.app/analyze</span>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-[#6C4DF6]/10 px-2 py-0.5 text-[10px] font-medium text-[#4F46E5]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#6C4DF6]" /> Live analysis
          </span>
        </div>

        <div className="mt-5 rounded-xl border border-black/5 bg-white/70 p-4">
          <div className="text-[11px] uppercase tracking-wider text-[#8b8b99]">Top headline suggestion</div>
          <h3 className="mt-2 text-[17px] font-semibold leading-snug text-[#0B0B14]">
            The Complete Guide to AI-Powered SEO in 2026 (With Real Examples)
          </h3>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {[
              ["CTR", 92, "#6C4DF6"],
              ["SEO", 94, "#4F46E5"],
              ["AEO", 88, "#00C2FF"],
              ["Read", 90, "#10b981"],
            ].map(([k, v, c]) => (
              <ScoreRing key={k as string} label={k as string} value={v as number} color={c as string} />
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5 text-[10px]">
            {["Emotion: Curiosity", "Power word: Complete", "Year token", "Entity: SEO"].map((t) => (
              <span key={t} className="rounded-full bg-[#6C4DF6]/8 px-2 py-0.5 text-[#4F46E5]">
                {t}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-3 space-y-2">
          {[
            { t: "9 Proven Headline Formulas That Boost CTR by 40%", ctr: 86, ai: 81 },
            { t: "Why Your Headlines Are Invisible to ChatGPT (And How to Fix It)", ctr: 79, ai: 92 },
            { t: "AI Search Is Here — Are Your Headlines Ready?", ctr: 74, ai: 88 },
          ].map((h, i) => (
            <div key={i} className="flex items-center justify-between gap-3 rounded-lg border border-black/5 bg-white/60 px-3 py-2.5">
              <div className="min-w-0 text-[13px] font-medium text-[#0B0B14]">{h.t}</div>
              <div className="flex shrink-0 items-center gap-2 text-[10px] text-[#6b6b7a]">
                <Badge value={h.ctr} label="CTR" />
                <Badge value={h.ai} label="AI" />
                <Copy size={12} className="text-[#8b8b99]" />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between rounded-xl bg-gradient-to-r from-[#6C4DF6]/10 via-[#4F46E5]/10 to-[#00C2FF]/10 px-3.5 py-2.5">
          <div className="flex items-center gap-2 text-[11px] text-[#4F46E5]">
            <Lightbulb size={12} /> Reasoning: front-loaded keyword + curiosity gap + entity recall
          </div>
          <span className="text-[11px] font-semibold text-[#4F46E5]">92/100</span>
        </div>
      </GlassCard>
    </div>
  );
}

function FloatingChip({ className = "", icon, label, color }: { className?: string; icon: React.ReactNode; label: string; color: string }) {
  return (
    <div className={`absolute z-10 ${className}`}>
      <div className="flex items-center gap-1.5 rounded-full border border-white/70 bg-white/80 px-3 py-1.5 text-xs font-semibold shadow-lg backdrop-blur">
        <span style={{ color }}>{icon}</span>
        <span className="text-[#0B0B14]">{label}</span>
      </div>
    </div>
  );
}

function Badge({ value, label }: { value: number; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-[#0B0B14]/5 px-1.5 py-0.5">
      <span className="font-semibold text-[#0B0B14]">{value}</span>
      <span>{label}</span>
    </span>
  );
}

function ScoreRing({ label, value, color }: { label: string; value: number; color: string }) {
  const r = 18;
  const c = 2 * Math.PI * r;
  const off = c - (value / 100) * c;
  return (
    <div className="flex flex-col items-center">
      <svg width="48" height="48" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r={r} fill="none" stroke="rgba(11,11,20,0.08)" strokeWidth="4" />
        <circle
          cx="24" cy="24" r={r} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={off}
          transform="rotate(-90 24 24)"
          style={{ transition: "stroke-dashoffset 1.2s ease" }}
        />
        <text x="24" y="27" textAnchor="middle" fontSize="11" fontWeight="700" fill="#0B0B14">{value}</text>
      </svg>
      <span className="mt-1 text-[10px] text-[#6b6b7a]">{label}</span>
    </div>
  );
}

/* ---------------------------------- Trust --------------------------------- */

function Trust() {
  const stats = [
    ["25+", "Headline formulas"],
    ["150+", "Emotional combinations"],
    ["40+", "Optimization signals"],
    ["10+", "Headline variations"],
    ["Millions", "Search impressions optimized"],
  ];
  const segments = ["News Publishers", "Marketing Teams", "SEO Agencies", "Startups", "Media Companies", "Content Creators"];
  return (
    <Section className="!py-16">
      <p data-reveal className="text-center text-sm font-medium uppercase tracking-[0.18em] text-[#8b8b99]">
        Trusted by modern content teams
      </p>
      <div data-reveal data-reveal-delay="1" className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {segments.map((s) => (
          <div key={s} className="flex h-14 items-center justify-center rounded-xl border border-black/5 bg-white/70 text-sm font-semibold text-[#6b6b7a] backdrop-blur hs-card-hover">
            {s}
          </div>
        ))}
      </div>
      <div data-reveal data-reveal-delay="2" className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-5">
        {stats.map(([n, l]) => (
          <div key={l} className="text-center">
            <div className="font-display text-4xl tracking-tight"><GradientText>{n}</GradientText></div>
            <div className="mt-1 text-xs text-[#6b6b7a]">{l}</div>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* --------------------------------- Problem -------------------------------- */

function Problem() {
  const pains = ["Low CTR", "Poor rankings", "Lower engagement", "Missed AI citations", "Lost traffic"];
  return (
    <Section>
      <div className="grid items-center gap-14 lg:grid-cols-2">
        <div data-reveal>
          <Pill><Target size={12} /> The problem</Pill>
          <h2 className="mt-5 font-display text-4xl leading-tight tracking-tight sm:text-5xl">
            Great content deserves <GradientText>better headlines.</GradientText>
          </h2>
          <p className="mt-5 text-[17px] leading-relaxed text-[#4a4a55]">
            Most creators spend hours writing articles — and minutes writing the headline. A weak headline silently
            costs you clicks, ranks, and AI citations. Today's headlines must appeal to humans, search engines, and AI
            assistants <em className="font-display">simultaneously.</em>
          </p>
          <ul className="mt-6 space-y-2.5">
            {pains.map((p) => (
              <li key={p} className="flex items-center gap-3 text-[15px] text-[#0B0B14]">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-rose-50 text-rose-500"><X size={14} /></span>
                {p}
              </li>
            ))}
          </ul>
        </div>
        <div data-reveal data-reveal-delay="2" className="grid gap-4">
          <HeadlineCompare
            kind="weak"
            text="10 Tips For Better Writing"
            notes={["No keyword", "No emotion", "Vague entity"]}
            scores={[32, 28, 18]}
          />
          <div className="flex items-center justify-center">
            <ArrowRight className="text-[#6C4DF6]" />
          </div>
          <HeadlineCompare
            kind="strong"
            text="10 AI-Era Writing Habits That Doubled My Search Traffic in 2026"
            notes={["Front-loaded keyword", "Curiosity gap", "Year + entity"]}
            scores={[92, 94, 88]}
          />
        </div>
      </div>
    </Section>
  );
}

function HeadlineCompare({
  kind, text, notes, scores,
}: { kind: "weak" | "strong"; text: string; notes: string[]; scores: [number, number, number] }) {
  const isStrong = kind === "strong";
  return (
    <GlassCard className={`p-5 ${isStrong ? "ring-1 ring-[#6C4DF6]/30" : ""}`}>
      <div className="flex items-center justify-between">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${isStrong ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
          {isStrong ? <Check size={11} /> : <X size={11} />} {isStrong ? "Optimized" : "Weak"}
        </span>
        <span className="text-[10px] text-[#8b8b99]">{text.length} chars</span>
      </div>
      <p className="mt-3 text-[17px] font-semibold leading-snug">{text}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {notes.map((n) => (
          <span key={n} className={`rounded-full px-2 py-0.5 text-[10px] ${isStrong ? "bg-[#6C4DF6]/10 text-[#4F46E5]" : "bg-[#0B0B14]/5 text-[#6b6b7a]"}`}>
            {n}
          </span>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {(["CTR", "SEO", "AEO"] as const).map((k, i) => (
          <div key={k} className="rounded-lg bg-white/60 px-2 py-2 text-center">
            <div className="text-[10px] uppercase tracking-wider text-[#8b8b99]">{k}</div>
            <div className={`text-lg font-bold ${isStrong ? "text-[#4F46E5]" : "text-[#6b6b7a]"}`}>{scores[i]}</div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

/* -------------------------------- Solution -------------------------------- */

function Solution() {
  const signals = [
    "Search Intent", "Audience Intent", "Keyword Position", "Headline Length",
    "Semantic Relevance", "Entity Recognition", "Readability", "Power Words",
    "Emotion", "Curiosity Gap", "AI Citation Potential", "SERP Compatibility",
  ];
  return (
    <Section>
      <div className="grid gap-14 lg:grid-cols-[1fr_1.05fr] lg:items-center">
        <div data-reveal>
          <Pill><Wand2 size={12} /> The solution</Pill>
          <h2 className="mt-5 font-display text-4xl leading-tight tracking-tight sm:text-5xl">
            Meet <GradientText>Headline Suggest.</GradientText>
          </h2>
          <p className="mt-5 text-[17px] leading-relaxed text-[#4a4a55]">
            Goes far beyond simple AI generation. Headline Suggest analyzes 40+ signals across SEO, AEO, psychology,
            and AI visibility — and explains the <em className="font-display">why</em> behind every recommendation.
            Data, not guesswork.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {signals.map((s) => (
              <div key={s} className="flex items-center gap-2 rounded-lg border border-black/5 bg-white/70 px-3 py-2 text-xs font-medium text-[#0B0B14] hs-card-hover">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: BRAND.primary }} />
                {s}
              </div>
            ))}
          </div>
        </div>
        <div data-reveal data-reveal-delay="2">
          <WorkflowAnim />
        </div>
      </div>
    </Section>
  );
}

function WorkflowAnim() {
  const steps = [
    { icon: <Type size={16} />, label: "Ingest content" },
    { icon: <Search size={16} />, label: "Analyze SERP + intent" },
    { icon: <Brain size={16} />, label: "AI scoring engine" },
    { icon: <Trophy size={16} />, label: "Ranked headlines" },
  ];
  return (
    <GlassCard className="relative overflow-hidden p-6">
      <div className="absolute inset-x-0 top-0 hs-shimmer h-px" />
      <div className="space-y-3">
        {steps.map((s, i) => (
          <div key={s.label} className="flex items-center gap-3 rounded-xl border border-black/5 bg-white/70 p-3">
            <div
              className="grid h-9 w-9 place-items-center rounded-lg text-white shadow"
              style={{ background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.accent})` }}
            >
              {s.icon}
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold">{s.label}</div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[#0B0B14]/5">
                <div
                  className="h-full"
                  style={{
                    width: `${[35, 60, 80, 100][i]}%`,
                    background: `linear-gradient(90deg, ${BRAND.primary}, ${BRAND.accent})`,
                  }}
                />
              </div>
            </div>
            <span className="text-[11px] font-semibold text-[#4F46E5]">{[35, 60, 80, 100][i]}%</span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

/* -------------------------------- Features -------------------------------- */

function Features() {
  const items: { icon: React.ReactNode; title: string; desc: string }[] = [
    { icon: <Wand2 size={18} />, title: "AI Headline Generator", desc: "Generate dozens of variations tuned to your topic, audience, and platform in one click." },
    { icon: <Search size={18} />, title: "SEO Optimization", desc: "Front-load keywords, hit ideal length, and align with SERP patterns automatically." },
    { icon: <Brain size={18} />, title: "AEO Optimization", desc: "Engineered to be quoted by ChatGPT, Gemini, Claude, and Perplexity." },
    { icon: <TrendingUp size={18} />, title: "CTR Prediction", desc: "ML-based click-through scoring trained on real headline performance signals." },
    { icon: <Gauge size={18} />, title: "Headline Analyzer", desc: "Paste any headline. Get a 12-axis performance report in seconds." },
    { icon: <Heart size={18} />, title: "Emotional Intelligence", desc: "Detect and tune emotion — curiosity, urgency, awe — across 150+ combinations." },
    { icon: <Target size={18} />, title: "Search Intent Detection", desc: "Match informational, navigational, transactional, and commercial intents precisely." },
    { icon: <Type size={18} />, title: "Keyword Placement", desc: "Suggests where each keyword belongs for max ranking lift." },
    { icon: <BarChart3 size={18} />, title: "Competitor Benchmarking", desc: "See how your headline stacks against the top 10 ranking pages." },
    { icon: <Lightbulb size={18} />, title: "AI Explanation Engine", desc: "Every score explained — no black boxes, no guesswork." },
    { icon: <Layers size={18} />, title: "Multiple Writing Styles", desc: "Blog, news, landing, YouTube, LinkedIn, email — tone-perfect for each." },
    { icon: <Copy size={18} />, title: "One-click Copy", desc: "Copy, favorite, and export. Built for fast newsroom workflows." },
  ];
  return (
    <Section id="features">
      <div data-reveal className="mx-auto max-w-2xl text-center">
        <Pill><Zap size={12} /> Features</Pill>
        <h2 className="mt-5 font-display text-4xl tracking-tight sm:text-5xl">
          A complete <GradientText>headline intelligence</GradientText> platform.
        </h2>
        <p className="mt-4 text-[17px] text-[#4a4a55]">
          Twelve capabilities working together to make every headline measurably better.
        </p>
      </div>
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((f, i) => (
          <div
            key={f.title}
            data-reveal
            data-reveal-delay={(i % 3) + 1}
            className="hs-card-hover group rounded-2xl border border-black/5 bg-white/70 p-6 backdrop-blur"
          >
            <div
              className="mb-4 grid h-10 w-10 place-items-center rounded-xl text-white shadow"
              style={{ background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.secondary})` }}
            >
              {f.icon}
            </div>
            <h3 className="text-[16px] font-semibold">{f.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-[#6b6b7a]">{f.desc}</p>
            <div className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#4F46E5] opacity-0 transition group-hover:opacity-100">
              Learn more <ArrowRight size={12} />
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ------------------------------ How It Works ------------------------------ */

function HowItWorks() {
  const steps = [
    { n: "01", t: "Paste your article or topic", d: "Drop in a URL, draft, or topic. Any length, any niche." },
    { n: "02", t: "AI analyzes the full landscape", d: "Content, competitors, keywords, intent, and AI visibility — in seconds." },
    { n: "03", t: "Get ranked headline suggestions", d: "Multiple options with detailed scores and reasoning." },
  ];
  return (
    <Section id="how">
      <div data-reveal className="mx-auto max-w-2xl text-center">
        <Pill><Rocket size={12} /> How it works</Pill>
        <h2 className="mt-5 font-display text-4xl tracking-tight sm:text-5xl">
          From topic to <GradientText>top-ranking headline</GradientText> in 30 seconds.
        </h2>
      </div>
      <div className="relative mt-14 grid gap-6 lg:grid-cols-3">
        <div className="absolute inset-x-12 top-12 hidden h-px lg:block" style={{ background: `linear-gradient(90deg, transparent, ${BRAND.primary}, ${BRAND.accent}, transparent)` }} />
        {steps.map((s, i) => (
          <div key={s.n} data-reveal data-reveal-delay={(i + 1) as 1 | 2 | 3} className="relative">
            <GlassCard className="p-6">
              <div className="flex items-center gap-3">
                <div
                  className="grid h-12 w-12 place-items-center rounded-2xl font-display text-xl text-white shadow-lg"
                  style={{ background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.accent})` }}
                >
                  {s.n}
                </div>
                <h3 className="text-lg font-semibold">{s.t}</h3>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-[#6b6b7a]">{s.d}</p>
            </GlassCard>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ----------------------------------- Demo --------------------------------- */

function Demo() {
  const [type, setType] = useState("Blog");
  const [article, setArticle] = useState("AI search engines are changing how people discover content. Publishers who optimize for both Google and AI assistants will own the next decade of organic traffic.");
  const [loading, setLoading] = useState(false);
  const [shown, setShown] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const headlines = [
    { t: "AI Search Is Rewriting SEO — Here's How Publishers Win the Next Decade", ctr: 92, seo: 94, aeo: 96, read: 88, emotion: "Authority", lift: "+48%", why: "Front-loaded keyword + time horizon + entity recall" },
    { t: "The Quiet Shift: Why Top Publishers Now Optimize for ChatGPT, Not Google", ctr: 87, seo: 81, aeo: 95, read: 90, emotion: "Curiosity", lift: "+42%", why: "Contrarian hook + named-entity citation potential" },
    { t: "9 AEO Tactics Smart Newsrooms Use to Get Cited by AI Assistants", ctr: 89, seo: 90, aeo: 94, read: 92, emotion: "Confidence", lift: "+39%", why: "Number list + power word + entity" },
    { t: "Your Headlines Are Invisible to AI. Here's the 5-Minute Fix.", ctr: 91, seo: 78, aeo: 93, read: 94, emotion: "Urgency", lift: "+44%", why: "Loss aversion + quick-win promise" },
    { t: "From SERP to AI Overview: A Practical Guide to Modern Discoverability", ctr: 81, seo: 92, aeo: 89, read: 87, emotion: "Clarity", lift: "+33%", why: "Journey framing + dual-platform intent" },
    { t: "Google AI vs ChatGPT: Where Your Headlines Should Actually Live", ctr: 85, seo: 86, aeo: 92, read: 91, emotion: "Curiosity", lift: "+37%", why: "Comparison frame + decision-stage intent" },
  ];

  const run = () => {
    setLoading(true);
    setShown(false);
    setTimeout(() => {
      setLoading(false);
      setShown(true);
      setTimeout(() => ref.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    }, 1100);
  };

  return (
    <Section id="demo">
      <div data-reveal className="mx-auto max-w-2xl text-center">
        <Pill><Play size={12} /> Live demo</Pill>
        <h2 className="mt-5 font-display text-4xl tracking-tight sm:text-5xl">
          Try it. <GradientText>See it work.</GradientText>
        </h2>
        <p className="mt-4 text-[17px] text-[#4a4a55]">No login. Paste anything below and generate a full headline report.</p>
      </div>

      <GlassCard data-reveal data-reveal-delay="2" className="mt-12 p-6">
        <label className="text-xs font-semibold uppercase tracking-wider text-[#8b8b99]">Paste article or topic</label>
        <textarea
          value={article}
          onChange={(e) => setArticle(e.target.value)}
          className="mt-2 min-h-32 w-full resize-none rounded-xl border border-black/10 bg-white/80 p-4 text-sm leading-relaxed text-[#0B0B14] outline-none transition focus:border-[#6C4DF6] focus:ring-4 focus:ring-[#6C4DF6]/15"
          placeholder="Paste your article, draft, or just a topic…"
        />
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-[#6b6b7a]">Content type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="rounded-lg border border-black/10 bg-white px-3 py-1.5 text-sm font-medium outline-none focus:border-[#6C4DF6]"
            >
              {["Blog", "News", "Landing Page", "YouTube", "LinkedIn", "Email"].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <button
            onClick={run}
            disabled={loading}
            className="group inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_30px_-10px_rgba(108,77,246,0.6)] transition hover:shadow-[0_14px_36px_-10px_rgba(108,77,246,0.8)] disabled:opacity-70"
            style={{ background: `linear-gradient(120deg, ${BRAND.primary}, ${BRAND.secondary})` }}
          >
            {loading ? (<><span className="h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" /> Analyzing…</>) : (<><Sparkles size={14} /> Generate Headlines</>)}
          </button>
        </div>
      </GlassCard>

      <div ref={ref} className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(shown ? headlines : []).map((h, i) => (
          <DemoHeadlineCard key={i} idx={i} h={h} />
        ))}
      </div>
    </Section>
  );
}

function DemoHeadlineCard({ idx, h }: { idx: number; h: { t: string; ctr: number; seo: number; aeo: number; read: number; emotion: string; lift: string; why: string } }) {
  const [fav, setFav] = useState(false);
  const [copied, setCopied] = useState(false);
  return (
    <GlassCard className="hs-card-hover p-5" >
      <div
        className="opacity-0 [animation:hs-fade-in_.6s_ease_forwards]"
        style={{ animation: `hs-fade-in .6s ease ${idx * 80}ms forwards` }}
      >
        <style>{`@keyframes hs-fade-in { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }`}</style>
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[15px] font-semibold leading-snug">{h.t}</h3>
          <button onClick={() => setFav(!fav)} className="shrink-0 rounded-md p-1 text-[#8b8b99] hover:text-rose-500" aria-label="Favorite">
            <Heart size={14} fill={fav ? "currentColor" : "none"} className={fav ? "text-rose-500" : ""} />
          </button>
        </div>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {[["CTR", h.ctr, BRAND.primary], ["SEO", h.seo, BRAND.secondary], ["AEO", h.aeo, BRAND.accent], ["Read", h.read, "#10b981"]].map(([k, v, c]) => (
            <ScoreRing key={k as string} label={k as string} value={v as number} color={c as string} />
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5 text-[10px]">
          <span className="rounded-full bg-[#6C4DF6]/10 px-2 py-0.5 text-[#4F46E5]">Emotion: {h.emotion}</span>
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">Est. {h.lift} clicks</span>
        </div>
        <p className="mt-3 flex items-start gap-2 text-[12px] leading-relaxed text-[#6b6b7a]">
          <Lightbulb size={12} className="mt-0.5 shrink-0 text-[#4F46E5]" /> {h.why}
        </p>
        <button
          onClick={() => { navigator.clipboard?.writeText(h.t); setCopied(true); setTimeout(() => setCopied(false), 1200); }}
          className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-black/10 bg-white/70 px-3 py-1.5 text-xs font-semibold text-[#0B0B14] hover:bg-white"
        >
          <Copy size={12} /> {copied ? "Copied!" : "Copy headline"}
        </button>
      </div>
    </GlassCard>
  );
}

/* ------------------------------ Performance ------------------------------- */

function Performance() {
  const widgets: [string, number, string][] = [
    ["CTR", 92, BRAND.primary], ["SEO", 94, BRAND.secondary], ["AEO", 88, BRAND.accent],
    ["Readability", 90, "#10b981"], ["Keyword Placement", 86, "#6C4DF6"], ["Power Words", 78, "#f59e0b"],
    ["Length", 95, "#4F46E5"], ["Search Intent", 91, "#00C2FF"], ["Entity Coverage", 84, "#8b5cf6"],
    ["Curiosity", 88, "#ec4899"], ["Clarity", 93, "#10b981"], ["Uniqueness", 81, "#06b6d4"],
  ];
  return (
    <Section>
      <div data-reveal className="mx-auto max-w-2xl text-center">
        <Pill><Gauge size={12} /> Performance analysis</Pill>
        <h2 className="mt-5 font-display text-4xl tracking-tight sm:text-5xl">
          Every headline gets a <GradientText>full performance report.</GradientText>
        </h2>
      </div>
      <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {widgets.map(([label, value, color], i) => (
          <GlassCard key={label} data-reveal data-reveal-delay={((i % 4) + 1) as 1 | 2 | 3 | 4} className="hs-card-hover flex items-center gap-4 p-5">
            <BigRing value={value} color={color} />
            <div>
              <div className="text-xs uppercase tracking-wider text-[#8b8b99]">{label}</div>
              <div className="font-display text-2xl">{value}</div>
            </div>
          </GlassCard>
        ))}
      </div>
    </Section>
  );
}

function BigRing({ value, color }: { value: number; color: string }) {
  const r = 22, c = 2 * Math.PI * r, off = c - (value / 100) * c;
  return (
    <svg width="58" height="58" viewBox="0 0 58 58">
      <circle cx="29" cy="29" r={r} fill="none" stroke="rgba(11,11,20,0.08)" strokeWidth="5" />
      <circle cx="29" cy="29" r={r} fill="none" stroke={color} strokeWidth="5" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={off} transform="rotate(-90 29 29)"
        style={{ transition: "stroke-dashoffset 1.2s ease" }} />
    </svg>
  );
}

/* ------------------------------- Comparison ------------------------------- */

function Comparison() {
  const rows = [
    ["Headline output", "Random titles", "Performance-scored headlines"],
    ["Scoring", "None", "12-axis report"],
    ["SEO analysis", "Missing", "Keyword + length + SERP"],
    ["AEO optimization", "Missing", "AI citation engineering"],
    ["CTR prediction", "Missing", "ML-based forecasting"],
    ["Explanations", "Black box", "Reasoning for every score"],
    ["Competitor benchmarking", "None", "Top 10 SERP analysis"],
    ["Audience + search intent", "Ignored", "Mapped + matched"],
    ["Entity analysis", "None", "NER + topical recall"],
  ];
  return (
    <Section>
      <div data-reveal className="mx-auto max-w-2xl text-center">
        <Pill><Trophy size={12} /> Comparison</Pill>
        <h2 className="mt-5 font-display text-4xl tracking-tight sm:text-5xl">
          Headline Suggest vs <GradientText>traditional AI tools.</GradientText>
        </h2>
      </div>
      <GlassCard data-reveal data-reveal-delay="2" className="mt-10 overflow-hidden">
        <div className="grid grid-cols-3 border-b border-black/5 bg-white/40 text-xs font-semibold uppercase tracking-wider text-[#6b6b7a]">
          <div className="px-5 py-4">Capability</div>
          <div className="px-5 py-4">Traditional AI</div>
          <div className="px-5 py-4 text-[#4F46E5]">Headline Suggest</div>
        </div>
        {rows.map(([c, a, b], i) => (
          <div key={c} className={`grid grid-cols-3 text-sm ${i % 2 ? "bg-white/30" : ""}`}>
            <div className="px-5 py-4 font-medium">{c}</div>
            <div className="flex items-center gap-2 px-5 py-4 text-[#6b6b7a]"><X size={14} className="text-rose-500" /> {a}</div>
            <div
              className="flex items-center gap-2 px-5 py-4 font-medium"
              style={{ background: i === 0 ? `linear-gradient(90deg, ${BRAND.primary}10, transparent)` : undefined }}
            >
              <Check size={14} className="text-emerald-500" /> {b}
            </div>
          </div>
        ))}
      </GlassCard>
    </Section>
  );
}

/* ------------------------------- Use Cases -------------------------------- */

function UseCases() {
  const items: { icon: React.ReactNode; t: string; d: string }[] = [
    { icon: <Newspaper size={18} />, t: "Publishers", d: "Increase article CTR across every section." },
    { icon: <BarChart3 size={18} />, t: "SEO Agencies", d: "Deliver measurable headline improvements to clients." },
    { icon: <Megaphone size={18} />, t: "Marketing Teams", d: "Lift campaign performance across every channel." },
    { icon: <Users size={18} />, t: "Bloggers", d: "Grow organic traffic with headlines that compound." },
    { icon: <Globe size={18} />, t: "Media Companies", d: "Optimize news headlines for breaking-news velocity." },
    { icon: <Rocket size={18} />, t: "SaaS Companies", d: "Increase landing-page conversion rates." },
    { icon: <ShoppingBag size={18} />, t: "E-commerce", d: "Create product titles that rank and convert." },
    { icon: <MessageSquare size={18} />, t: "Creators", d: "Make every post YouTube, LinkedIn, and Twitter-ready." },
  ];
  return (
    <Section id="use-cases">
      <div data-reveal className="mx-auto max-w-2xl text-center">
        <Pill><Users size={12} /> Solutions</Pill>
        <h2 className="mt-5 font-display text-4xl tracking-tight sm:text-5xl">
          Built for <GradientText>every content team.</GradientText>
        </h2>
      </div>
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((u, i) => (
          <div
            key={u.t}
            data-reveal data-reveal-delay={((i % 4) + 1) as 1 | 2 | 3 | 4}
            className="hs-card-hover rounded-2xl border border-black/5 bg-white/70 p-5 backdrop-blur"
          >
            <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl text-white" style={{ background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.accent})` }}>
              {u.icon}
            </div>
            <h3 className="text-[15px] font-semibold">{u.t}</h3>
            <p className="mt-1.5 text-sm text-[#6b6b7a]">{u.d}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ------------------------------ Testimonials ------------------------------ */

function Testimonials() {
  const t = [
    { name: "Priya Menon", role: "Editor-in-Chief, MorningDigest", quote: "We doubled our article CTR in eight weeks. The reasoning behind every score is what makes it stick with my writers." , initials: "PM"},
    { name: "Daniel Cho", role: "SEO Lead, NorthStar Agency", quote: "Finally a tool that scores AEO. Our clients see their headlines quoted by ChatGPT — it's a measurable win we report monthly.", initials: "DC" },
    { name: "Anika Verma", role: "Growth, Lumen SaaS", quote: "Replaced three different headline tools with this. The competitor benchmarks alone are worth the subscription.", initials: "AV" },
  ];
  return (
    <Section>
      <div data-reveal className="mx-auto max-w-2xl text-center">
        <Pill><Star size={12} /> Testimonials</Pill>
        <h2 className="mt-5 font-display text-4xl tracking-tight sm:text-5xl">
          Loved by <GradientText>content teams</GradientText> who measure everything.
        </h2>
      </div>
      <div className="mt-12 grid gap-5 lg:grid-cols-3">
        {t.map((q, i) => (
          <GlassCard key={q.name} data-reveal data-reveal-delay={((i % 3) + 1) as 1 | 2 | 3} className="hs-card-hover p-6">
            <div className="flex items-center gap-1 text-amber-400">
              {Array.from({ length: 5 }).map((_, k) => <Star key={k} size={14} fill="currentColor" />)}
            </div>
            <p className="mt-4 text-[15px] leading-relaxed text-[#0B0B14]">"{q.quote}"</p>
            <div className="mt-5 flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full font-semibold text-white" style={{ background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.secondary})` }}>
                {q.initials}
              </div>
              <div>
                <div className="text-sm font-semibold">{q.name}</div>
                <div className="text-xs text-[#6b6b7a]">{q.role}</div>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </Section>
  );
}

/* --------------------------------- Pricing -------------------------------- */

function Pricing() {
  const plans = [
    { name: "Free", price: "$0", period: "forever", cta: "Get started", highlight: false,
      features: ["10 generations / day", "Basic analysis", "Copy headlines", "Community support"] },
    { name: "Pro", price: "$29", period: "/ month", cta: "Start free trial", highlight: true,
      features: ["Unlimited generations", "Advanced SEO + AEO", "Headline Analyzer", "Competitor Analysis", "Export & API", "Priority support"] },
    { name: "Enterprise", price: "Custom", period: "", cta: "Contact sales", highlight: false,
      features: ["Unlimited team members", "SSO + audit logs", "Dedicated AI capacity", "Priority onboarding", "Custom integrations"] },
  ];
  return (
    <Section id="pricing">
      <div data-reveal className="mx-auto max-w-2xl text-center">
        <Pill><Sparkles size={12} /> Pricing</Pill>
        <h2 className="mt-5 font-display text-4xl tracking-tight sm:text-5xl">
          Simple pricing. <GradientText>Serious results.</GradientText>
        </h2>
      </div>
      <div className="mt-12 grid gap-5 lg:grid-cols-3">
        {plans.map((p, i) => (
          <div
            key={p.name}
            data-reveal data-reveal-delay={((i % 3) + 1) as 1 | 2 | 3}
            className={`relative rounded-2xl border p-7 backdrop-blur hs-card-hover ${
              p.highlight ? "border-transparent text-white shadow-[0_30px_80px_-30px_rgba(108,77,246,0.7)]" : "border-black/5 bg-white/70"
            }`}
            style={p.highlight ? { background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.secondary})` } : undefined}
          >
            {p.highlight && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#4F46E5] shadow">
                Most popular
              </span>
            )}
            <div className={`text-sm font-semibold uppercase tracking-wider ${p.highlight ? "text-white/80" : "text-[#8b8b99]"}`}>{p.name}</div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="font-display text-5xl">{p.price}</span>
              {p.period && <span className={`text-sm ${p.highlight ? "text-white/80" : "text-[#6b6b7a]"}`}>{p.period}</span>}
            </div>
            <ul className={`mt-6 space-y-2.5 text-sm ${p.highlight ? "text-white/90" : "text-[#0B0B14]"}`}>
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check size={16} className={p.highlight ? "mt-0.5 text-white" : "mt-0.5 text-emerald-500"} />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              to="/login"
              className={`mt-7 inline-flex w-full items-center justify-center gap-1.5 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                p.highlight
                  ? "bg-white text-[#4F46E5] hover:bg-white/90"
                  : "border border-black/10 bg-white text-[#0B0B14] hover:bg-[#0B0B14] hover:text-white"
              }`}
            >
              {p.cta} <ArrowRight size={14} />
            </Link>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ----------------------------------- FAQ ---------------------------------- */

function FAQ() {
  const qs = [
    ["What is AEO?", "Answer Engine Optimization — the practice of structuring content (and headlines) so that AI assistants like ChatGPT, Gemini, Claude, and Perplexity quote and cite you in their answers."],
    ["How is this different from ChatGPT?", "ChatGPT writes a headline. We score it across 12 axes — SEO, AEO, CTR, emotion, intent, entities — and explain why each variation will perform."],
    ["Can I optimize existing headlines?", "Yes. Paste any headline into the Analyzer to get the full performance report and improvement suggestions."],
    ["Does it work for YouTube?", "Yes — switch the content type to YouTube and we tune length, curiosity gap, and keyword placement for video discovery."],
    ["Can publishers use it?", "Absolutely. Newsrooms use Headline Suggest to ship breaking news with confident, high-CTR headlines in seconds."],
    ["How accurate are the scores?", "Scores are trained on real headline performance signals and SERP data, and every score includes the reasoning so editors can apply judgment."],
    ["Can agencies use this for clients?", "Yes. The Pro and Enterprise plans support multi-project workflows, exports, and API access for client deliverables."],
  ];
  const [open, setOpen] = useState<number | null>(0);
  return (
    <Section id="faq">
      <div data-reveal className="mx-auto max-w-2xl text-center">
        <Pill><MessageSquare size={12} /> FAQ</Pill>
        <h2 className="mt-5 font-display text-4xl tracking-tight sm:text-5xl">
          Questions, <GradientText>answered.</GradientText>
        </h2>
      </div>
      <div data-reveal data-reveal-delay="2" className="mx-auto mt-10 max-w-3xl space-y-3">
        {qs.map(([q, a], i) => {
          const isOpen = open === i;
          return (
            <GlassCard key={q} className="overflow-hidden">
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <span className="text-[15px] font-semibold">{q}</span>
                <ChevronDown size={18} className={`shrink-0 text-[#6b6b7a] transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>
              <div
                className="grid transition-[grid-template-rows] duration-300 ease-out"
                style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
              >
                <div className="overflow-hidden">
                  <p className="px-5 pb-5 text-sm leading-relaxed text-[#4a4a55]">{a}</p>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </Section>
  );
}

/* -------------------------------- Final CTA ------------------------------- */

function FinalCTA() {
  return (
    <Section className="!py-28">
      <div
        data-reveal
        className="relative overflow-hidden rounded-3xl px-8 py-16 text-center text-white sm:px-16"
        style={{ background: `linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.secondary} 50%, ${BRAND.accent} 100%)` }}
      >
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: "radial-gradient(circle at 20% 20%, rgba(255,255,255,.4), transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,.3), transparent 50%)",
        }} />
        <div className="relative">
          <h2 className="font-display text-4xl leading-tight tracking-tight sm:text-6xl">
            Every great article starts with a great headline.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-white/90">
            Stop relying on guesswork. Use AI combined with search intelligence to create headlines that perform
            better across search engines and AI assistants.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/login" className="group inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-[#4F46E5] shadow-xl transition hover:bg-white/95">
              Generate Headlines Free <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a href="#demo" className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur hover:bg-white/20">
              Book a Demo
            </a>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ---------------------------------- Footer -------------------------------- */

function Footer() {
  const cols: { title: string; links: string[] }[] = [
    { title: "Product", links: ["Features", "Pricing", "Blog", "Changelog"] },
    { title: "Resources", links: ["Documentation", "API", "Guides", "Status"] },
    { title: "Company", links: ["About", "Customers", "Contact", "Careers"] },
    { title: "Legal", links: ["Privacy", "Terms", "Security", "DPA"] },
  ];
  return (
    <footer className="relative mt-10 border-t border-black/5 bg-white/60 backdrop-blur">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-xl text-white shadow" style={{ background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.accent})` }}>
                <Sparkles size={16} />
              </div>
              <span className="text-[15px] font-semibold tracking-tight">Headline Suggest</span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-[#6b6b7a]">
              The AI headline intelligence platform built for the era of Google AI, ChatGPT, Gemini, and Perplexity.
            </p>
            <form className="mt-5 flex max-w-sm items-center gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="you@company.com"
                className="min-w-0 flex-1 rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-[#6C4DF6]"
              />
              <button className="rounded-lg px-3 py-2 text-sm font-semibold text-white" style={{ background: `linear-gradient(120deg, ${BRAND.primary}, ${BRAND.secondary})` }}>
                Subscribe
              </button>
            </form>
            <div className="mt-5 flex items-center gap-3 text-[#6b6b7a]">
              {[Twitter, Linkedin, Github, Mail].map((I, i) => (
                <a key={i} href="#" className="grid h-9 w-9 place-items-center rounded-lg border border-black/5 bg-white/70 hover:text-[#4F46E5]"><I size={15} /></a>
              ))}
            </div>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <div className="text-xs font-semibold uppercase tracking-wider text-[#8b8b99]">{c.title}</div>
              <ul className="mt-4 space-y-2 text-sm text-[#4a4a55]">
                {c.links.map((l) => (
                  <li key={l}><a href="#" className="hs-underline-link hover:text-[#0B0B14]">{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-black/5 pt-6 text-xs text-[#6b6b7a]">
          <span>© {new Date().getFullYear()} Headline Suggest. All rights reserved.</span>
          <span>Made for publishers, marketers, and the AI search era.</span>
        </div>
      </div>
    </footer>
  );
}
