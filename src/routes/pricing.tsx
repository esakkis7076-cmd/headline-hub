import { createFileRoute, Link } from "@tanstack/react-router";
import { MessageCircle, Sparkles } from "lucide-react";

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

const WHATSAPP_DIGITS = "916380992671";


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

      <section className="mx-auto max-w-6xl px-4 py-10 text-center sm:px-6 sm:py-14">
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


      <section className="mx-auto max-w-3xl px-4 pb-8 sm:px-6 sm:pb-10">
        <p className="text-center text-sm text-muted-foreground">
          We also accept <b className="text-foreground">UPI</b>, <b className="text-foreground">NEFT/IMPS bank transfer</b>,
          and <b className="text-foreground">Razorpay</b>. Contact us to get started.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6 sm:pb-16">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="flex h-full flex-col rounded-2xl border border-border/60 bg-card/40 p-5 sm:p-7">
            <div className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Starter</div>
            <div className="mt-3 font-serif text-4xl font-semibold">₹5,000</div>
            <div className="text-muted-foreground">per month · billed monthly</div>
            <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
              <li>✓ 2 languages</li>
              <li>✓ 50 headline sets / month</li>
              <li>✓ SEO scoring</li>
              <li>✓ FAQ schema (AEO)</li>
              <li>✓ Email support</li>
            </ul>
            <a
              href={`https://wa.me/${WHATSAPP_DIGITS}?text=${encodeURIComponent("Hi TestKaro, I want to discuss the Starter plan.")}`}
              target="_blank"
              rel="noreferrer"
              className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border/60 px-5 py-2.5 text-sm font-semibold hover:bg-accent"
            >
              <MessageCircle size={16} /> Contact us
            </a>
          </div>

          <div className="flex h-full flex-col rounded-2xl border border-border/60 bg-card/40 p-5 shadow-lg sm:p-7">
            <div className="mb-3 inline-flex rounded-full bg-orange-500 px-3 py-1 text-xs font-semibold text-white">Most popular</div>
            <div className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Growth</div>
            <div className="mt-3 font-serif text-4xl font-semibold">₹12,000</div>
            <div className="text-muted-foreground">per month · billed monthly</div>
            <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
              <li>✓ 5 languages</li>
              <li>✓ 200 headline sets / month</li>
              <li>✓ Section-level insights</li>
              <li>✓ AI style recommendations</li>
              <li>✓ AEO optimizer</li>
              <li>✓ Priority support</li>
            </ul>
            <a
              href={`https://wa.me/${WHATSAPP_DIGITS}?text=${encodeURIComponent("Hi TestKaro, I want to discuss the Growth plan.")}`}
              target="_blank"
              rel="noreferrer"
              className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              <MessageCircle size={16} /> Contact us
            </a>
          </div>

          <div className="flex h-full flex-col rounded-2xl border border-border/60 bg-card/40 p-5 sm:p-7">
            <div className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Enterprise</div>
            <div className="mt-3 font-serif text-4xl font-semibold">₹30,000</div>
            <div className="text-muted-foreground">per month · custom billing</div>
            <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
              <li>✓ All 9 languages</li>
              <li>✓ Unlimited headline sets</li>
              <li>✓ API access</li>
              <li>✓ Multi-site dashboard</li>
              <li>✓ Custom integrations</li>
              <li>✓ Dedicated account manager</li>
            </ul>
            <a
              href={`https://wa.me/${WHATSAPP_DIGITS}?text=${encodeURIComponent("Hi TestKaro, I want to discuss the Enterprise plan.")}`}
              target="_blank"
              rel="noreferrer"
              className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border/60 px-5 py-2.5 text-sm font-semibold hover:bg-accent"
            >
              <MessageCircle size={16} /> Talk to sales
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
