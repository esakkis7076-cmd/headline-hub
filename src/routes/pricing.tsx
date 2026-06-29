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

const WHATSAPP = "+916380992671";
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
