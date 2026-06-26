import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, MessageCircle, Sparkles } from "lucide-react";

export const Route = createFileRoute("/pricing")({
  component: PricingPage,
  head: () => ({
    meta: [
      { title: "Pricing — TestKaro" },
      {
        name: "description",
        content:
          "Simple monthly plans for Indian newsrooms. Pay via UPI, NEFT/IMPS, Razorpay or Stripe. 14-day free trial.",
      },
      { property: "og:title", content: "Pricing — TestKaro" },
      {
        property: "og:description",
        content:
          "Plans built for Indian newsroom budgets. UPI, NEFT/IMPS and card payments accepted.",
      },
    ],
  }),
});

const WHATSAPP = "+916380992671";
const WHATSAPP_DIGITS = "916380992671";
const EMAIL = "esakkis7076@gmail.com";

type Plan = {
  tier: string;
  price: string;
  per: string;
  features: string[];
  popular?: boolean;
  cta: string;
  whatsappText: string;
};

const PLANS: Plan[] = [
  {
    tier: "Starter",
    price: "₹5,000",
    per: "per month · billed monthly",
    features: [
      "2 languages",
      "50 headline sets / month",
      "SEO scoring",
      "FAQ schema (AEO)",
      "Email support",
    ],
    cta: "Start free trial",
    whatsappText: "Hi, I'm interested in the Starter plan (₹5,000/month)",
  },
  {
    tier: "Growth",
    price: "₹12,000",
    per: "per month · billed monthly",
    popular: true,
    features: [
      "5 languages",
      "200 headline sets / month",
      "Section-level insights",
      "AI style recommendations",
      "AEO optimizer",
      "Priority support",
    ],
    cta: "Start free trial",
    whatsappText: "Hi, I'm interested in the Growth plan (₹12,000/month)",
  },
  {
    tier: "Enterprise",
    price: "₹30,000",
    per: "per month · custom billing",
    features: [
      "All 9 languages",
      "Unlimited headline sets",
      "API access",
      "Multi-site dashboard",
      "Custom integrations",
      "Dedicated account manager",
    ],
    cta: "Talk to sales",
    whatsappText: "Hi, I'd like to talk to sales about the Enterprise plan",
  },
];

function PricingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60">
        <div className="mx-auto max-w-6xl px-6 py-5 flex items-center justify-between">
          <Link to="/" className="font-serif text-lg font-semibold">TestKaro</Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link to="/" className="text-muted-foreground hover:text-foreground">Home</Link>
            <Link to="/login" className="rounded-lg bg-primary px-3 py-1.5 text-primary-foreground font-semibold hover:bg-primary/90">
              Sign in
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-14 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-3 py-1 text-xs uppercase tracking-wider text-muted-foreground">
          <Sparkles size={12} /> Pricing
        </div>
        <h1 className="mt-4 font-serif text-4xl sm:text-5xl font-semibold tracking-tight">
          Built for Indian newsroom <em className="text-primary not-italic">budgets.</em>
        </h1>
        <p className="mt-3 text-muted-foreground">
          14-day free trial on every plan. No credit card required. No hidden setup fees.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-10 grid grid-cols-1 md:grid-cols-3 gap-5">
        {PLANS.map((p) => (
          <div
            key={p.tier}
            className={`relative rounded-2xl border p-7 flex flex-col ${
              p.popular
                ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                : "border-border/60 bg-card/30"
            }`}
          >
            {p.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-primary-foreground">
                Most popular
              </span>
            )}
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{p.tier}</div>
            <div className="mt-2 text-4xl font-semibold tabular-nums">{p.price}</div>
            <div className="text-xs text-muted-foreground">{p.per}</div>
            <ul className="mt-5 space-y-2 text-sm flex-1">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check size={14} className="mt-0.5 text-emerald-400 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <a
              href={`https://wa.me/${WHATSAPP_DIGITS}?text=${encodeURIComponent(p.whatsappText)}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`mt-6 text-center rounded-lg px-4 py-2.5 text-sm font-semibold ${
                p.popular
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "border border-border hover:bg-accent"
              }`}
            >
              {p.cta}
            </a>
            <div className="mt-4 rounded-lg border border-dashed border-border/70 bg-background/40 p-3 text-[11px] text-muted-foreground">
              Pay via UPI / Bank Transfer? WhatsApp us at{" "}
              <a className="text-primary hover:underline" href={`https://wa.me/${WHATSAPP_DIGITS}`}>{WHATSAPP}</a>{" "}
              or email{" "}
              <a className="text-primary hover:underline" href={`mailto:${EMAIL}`}>{EMAIL}</a>.
            </div>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-10">
        <p className="text-center text-sm text-muted-foreground">
          We also accept <b className="text-foreground">UPI</b>, <b className="text-foreground">NEFT/IMPS bank transfer</b>,
          and <b className="text-foreground">Razorpay</b>. Contact us to get started.
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-16">
        <div className="rounded-2xl border border-border/60 bg-card/40 p-7 text-center">
          <h2 className="font-serif text-2xl font-semibold">Questions? Talk to us on WhatsApp</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Get a personalised walkthrough, payment help, or activation support on WhatsApp.
          </p>
          <a
            href={`https://wa.me/${WHATSAPP_DIGITS}?text=${encodeURIComponent(
              "Hi TestKaro, I have a question about pricing.",
            )}`}
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600"
          >
            <MessageCircle size={16} /> Chat on WhatsApp
          </a>
        </div>
      </section>
    </div>
  );
}
