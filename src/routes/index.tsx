import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&family=DM+Mono:wght@400;500&display=swap",
      },
    ],
    meta: [
      { title: "Story Pulse — AI Headline Optimizer for Indian Newsrooms" },
      { name: "description", content: "AI generates platform-specific headlines for Search, Social & WhatsApp in 9 Indian languages. SEO score + FAQ schema in 30 seconds. Zero integration." },
    ],
  }),
});

const HTML = `<style>
  :root {
    --ink: #0f0e0d;
    --ink-soft: #2a2825;
    --ink-muted: #6b6560;
    --paper: #f5f0e8;
    --paper-warm: #ede8dc;
    --paper-dark: #d6cfbf;
    --accent: #c8410a;
    --accent-light: #f0622a;
    --gold: #c49a2a;
    --green-win: #1a6b3a;
    --rule: rgba(15,14,13,0.12);
    --rule-heavy: rgba(15,14,13,0.35);
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  html { scroll-behavior: smooth; }

  body {
    background: var(--paper);
    color: var(--ink);
    font-family: 'DM Sans', sans-serif;
    font-weight: 300;
    line-height: 1.65;
    overflow-x: hidden;
  }

  /* ── NOISE TEXTURE OVERLAY ── */
  body::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
    pointer-events: none;
    z-index: 1000;
    opacity: 0.6;
  }

  /* ── NAV ── */
  nav {
    position: sticky;
    top: 0;
    z-index: 100;
    background: var(--ink);
    border-bottom: 3px solid var(--accent);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 2.5rem;
    height: 56px;
  }
  @media (max-width: 900px) {
    nav {
      padding: 0 1.1rem;
    }
  }

  .nav-logo {
    font-family: 'Playfair Display', serif;
    font-weight: 900;
    font-size: 1.3rem;
    color: var(--paper);
    letter-spacing: -0.01em;
    text-decoration: none;
  }
  .nav-logo span { color: var(--accent); }

  .nav-links {
    display: flex;
    gap: 2rem;
    list-style: none;
  }
  .nav-links a {
    color: rgba(245,240,232,0.55);
    text-decoration: none;
    font-size: 0.78rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-weight: 400;
    transition: color 0.2s;
  }
  .nav-links a:hover { color: var(--paper); }

  .nav-cta {
    background: var(--accent);
    color: var(--paper) !important;
    padding: 0.4rem 1.1rem;
    border-radius: 2px;
    font-weight: 500 !important;
    transition: background 0.2s !important;
  }
  .nav-cta:hover { background: var(--accent-light) !important; }

  /* ── MASTHEAD DATELINE ── */
  .dateline {
    background: var(--ink);
    color: rgba(245,240,232,0.4);
    font-family: 'DM Mono', monospace;
    font-size: 0.68rem;
    letter-spacing: 0.12em;
    text-align: center;
    padding: 0.45rem 0;
    border-bottom: 1px solid rgba(245,240,232,0.1);
  }

  /* ── HERO ── */
  .hero {
    padding: 4rem 2.5rem 3rem;
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4rem;
    align-items: start;
  }
  @media (max-width: 900px) {
    .hero {
      padding: 2.8rem 1.1rem 2.2rem;
    }
  }

  .hero-kicker {
    font-family: 'DM Mono', monospace;
    font-size: 0.7rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--accent);
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .hero-kicker::before {
    content: '';
    display: inline-block;
    width: 24px;
    height: 2px;
    background: var(--accent);
  }

  h1 {
    font-family: 'Playfair Display', serif;
    font-weight: 900;
    font-size: clamp(2.6rem, 4.5vw, 4rem);
    line-height: 1.05;
    letter-spacing: -0.02em;
    color: var(--ink);
    margin-bottom: 1.2rem;
  }
  h1 em {
    font-style: italic;
    color: var(--accent);
  }

  .hero-sub {
    font-size: 1.05rem;
    color: var(--ink-muted);
    line-height: 1.7;
    margin-bottom: 1.8rem;
    max-width: 440px;
    font-weight: 300;
  }

  .hero-sub strong { color: var(--ink); font-weight: 500; }

  .hero-btns {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
    margin-bottom: 2rem;
  }
  @media (max-width: 640px) {
    .hero-btns {
      flex-direction: column;
    }
    .hero-btns a,
    .hero-btns .btn-primary,
    .hero-btns .btn-ghost {
      width: 100%;
      justify-content: center;
    }
  }

  .btn-primary {
    background: var(--accent);
    color: var(--paper);
    padding: 0.75rem 1.75rem;
    border-radius: 2px;
    font-size: 0.9rem;
    font-weight: 500;
    text-decoration: none;
    letter-spacing: 0.02em;
    border: 2px solid var(--accent);
    transition: all 0.2s;
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
  }
  .btn-primary:hover {
    background: transparent;
    color: var(--accent);
  }

  .btn-ghost {
    background: transparent;
    color: var(--ink);
    padding: 0.75rem 1.5rem;
    border-radius: 2px;
    font-size: 0.9rem;
    font-weight: 400;
    text-decoration: none;
    border: 1.5px solid var(--rule-heavy);
    transition: all 0.2s;
  }
  .btn-ghost:hover {
    border-color: var(--ink);
    background: var(--ink);
    color: var(--paper);
  }

  .trust-pills {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .pill {
    font-family: 'DM Mono', monospace;
    font-size: 0.67rem;
    letter-spacing: 0.06em;
    border: 1px solid var(--rule-heavy);
    padding: 0.28rem 0.6rem;
    border-radius: 2px;
    color: var(--ink-muted);
    background: var(--paper-warm);
  }

  /* ── LIVE DEMO WIDGET ── */
  .demo-widget {
    background: var(--ink);
    border-radius: 4px;
    overflow: hidden;
    box-shadow: 8px 8px 0 var(--accent), 16px 16px 0 rgba(15,14,13,0.15);
  }

  .demo-topbar {
    background: var(--ink-soft);
    padding: 0.6rem 1rem;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }
  .demo-dot { width: 9px; height: 9px; border-radius: 50%; }
  .demo-dot.r { background: #ff5f57; }
  .demo-dot.y { background: #febc2e; }
  .demo-dot.g { background: #28c840; }
  .demo-url {
    margin-left: 0.5rem;
    font-family: 'DM Mono', monospace;
    font-size: 0.67rem;
    color: rgba(255,255,255,0.3);
    letter-spacing: 0.03em;
  }

  .demo-body { padding: 1.25rem; }

  .demo-label {
    font-family: 'DM Mono', monospace;
    font-size: 0.6rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.3);
    margin-bottom: 0.5rem;
  }

  .demo-article-title {
    font-family: 'Playfair Display', serif;
    font-size: 0.95rem;
    color: rgba(245,240,232,0.7);
    line-height: 1.4;
    margin-bottom: 1.2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba(255,255,255,0.07);
  }

  .demo-variants { display: flex; flex-direction: column; gap: 0.6rem; }

  .demo-variant {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 3px;
    padding: 0.75rem 1rem;
    transition: all 0.3s;
    position: relative;
  }
  .demo-variant.winning {
    border-color: var(--green-win);
    background: rgba(26,107,58,0.15);
  }

  .demo-variant-tag {
    font-family: 'DM Mono', monospace;
    font-size: 0.58rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-bottom: 0.35rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .tag-search { color: #5b9bd5; }
  .tag-social { color: #c49a2a; }
  .tag-whatsapp { color: #25d366; }

  .demo-variant-text {
    font-size: 0.85rem;
    color: rgba(245,240,232,0.85);
    line-height: 1.4;
    font-family: 'DM Sans', sans-serif;
    font-weight: 300;
  }

  .demo-score {
    font-family: 'DM Mono', monospace;
    font-size: 0.65rem;
    color: rgba(255,255,255,0.35);
    margin-top: 0.3rem;
  }
  .demo-score.green { color: var(--green-win); }
  .demo-score.gold { color: var(--gold); }

  .win-badge {
    font-family: 'DM Mono', monospace;
    font-size: 0.6rem;
    background: var(--green-win);
    color: #fff;
    padding: 0.15rem 0.4rem;
    border-radius: 2px;
    letter-spacing: 0.06em;
  }

  .demo-footer {
    padding: 0.75rem 1.25rem;
    background: rgba(0,0,0,0.2);
    border-top: 1px solid rgba(255,255,255,0.05);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .demo-langs {
    display: flex;
    gap: 0.3rem;
    flex-wrap: wrap;
  }
  .lang-chip {
    font-size: 0.7rem;
    background: rgba(255,255,255,0.06);
    padding: 0.15rem 0.4rem;
    border-radius: 2px;
    color: rgba(255,255,255,0.4);
  }
  .lang-chip.active {
    background: rgba(200,65,10,0.3);
    color: rgba(245,200,180,0.9);
  }
  .demo-processing {
    font-family: 'DM Mono', monospace;
    font-size: 0.6rem;
    color: rgba(255,255,255,0.25);
    letter-spacing: 0.06em;
  }

  /* ── DIVIDER ── */
  .section-rule {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2.5rem;
    border: none;
    border-top: 3px double var(--rule-heavy);
    margin-top: 3rem;
    margin-bottom: 3rem;
  }

  /* ── STATS BAR ── */
  .stats-bar {
    background: var(--ink);
    padding: 2rem 2.5rem;
  }
  .stats-inner {
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0;
  }
  .stat-item {
    padding: 0.5rem 2rem;
    border-right: 1px solid rgba(255,255,255,0.08);
    text-align: center;
  }
  .stat-item:first-child { padding-left: 0; }
  .stat-item:last-child { border-right: none; }
  .stat-num {
    font-family: 'Playfair Display', serif;
    font-size: 2.2rem;
    font-weight: 900;
    color: var(--paper);
    display: block;
    line-height: 1;
    margin-bottom: 0.3rem;
  }
  .stat-num span { color: var(--accent); }
  .stat-desc {
    font-size: 0.75rem;
    color: rgba(245,240,232,0.4);
    letter-spacing: 0.04em;
    font-weight: 300;
  }

  /* ── HOW IT WORKS ── */
  .section {
    max-width: 1200px;
    margin: 0 auto;
    padding: 3.5rem 2.5rem;
  }
  @media (max-width: 900px) {
    .section {
      padding: 2.6rem 1.1rem;
    }
  }

  .section-eyebrow {
    font-family: 'DM Mono', monospace;
    font-size: 0.68rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--accent);
    margin-bottom: 0.6rem;
  }

  h2 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(1.8rem, 3vw, 2.6rem);
    font-weight: 900;
    line-height: 1.1;
    letter-spacing: -0.02em;
    margin-bottom: 0.75rem;
  }

  h2 em { font-style: italic; color: var(--accent); }

  .section-sub {
    font-size: 0.95rem;
    color: var(--ink-muted);
    max-width: 520px;
    margin-bottom: 2.5rem;
    font-weight: 300;
  }

  /* ── HOW STEPS ── */
  .steps-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0;
    border: 1.5px solid var(--rule-heavy);
    border-radius: 3px;
    overflow: hidden;
  }
  @media (max-width: 640px) {
    .steps-grid {
      grid-template-columns: 1fr;
    }
    .steps-grid .step-cell:nth-child(n) {
      border-right: none;
    }
    .steps-grid .step-cell:nth-child(n+4) {
      border-bottom: 1px solid var(--rule);
    }
    .steps-grid .step-cell:last-child {
      border-bottom: none;
    }
  }

  .step-cell {
    padding: 1.75rem;
    border-right: 1px solid var(--rule);
    border-bottom: 1px solid var(--rule);
    background: var(--paper);
    transition: background 0.2s;
    position: relative;
  }
  .step-cell:hover { background: var(--paper-warm); }
  .step-cell:nth-child(3n) { border-right: none; }
  .step-cell:nth-child(n+4) { border-bottom: none; }

  .step-num {
    font-family: 'Playfair Display', serif;
    font-size: 3rem;
    font-weight: 900;
    color: var(--accent);
    line-height: 1;
    margin-bottom: 0.75rem;
    display: block;
  }

  .step-title {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--ink);
    margin-bottom: 0.5rem;
    line-height: 1.3;
  }

  .step-desc {
    font-size: 0.82rem;
    color: var(--ink-muted);
    font-weight: 300;
    line-height: 1.6;
  }

  /* ── LANGUAGES ── */
  .lang-section {
    background: var(--ink);
    padding: 3.5rem 2.5rem;
  }
  .lang-inner {
    max-width: 1200px;
    margin: 0 auto;
  }
  .lang-inner .section-eyebrow { color: var(--gold); }
  .lang-inner h2 { color: var(--paper); }
  .lang-inner .section-sub { color: rgba(245,240,232,0.45); }

  .lang-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 1px;
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 3px;
    overflow: hidden;
    margin-top: 2rem;
  }
  @media (max-width: 640px) {
    .lang-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  .lang-tile {
    background: rgba(255,255,255,0.03);
    padding: 1.5rem 1rem;
    text-align: center;
    cursor: pointer;
    transition: background 0.2s;
  }
  .lang-tile:hover { background: rgba(200,65,10,0.2); }

  .lang-script {
    font-size: 1.6rem;
    margin-bottom: 0.4rem;
    display: block;
    color: rgba(245,240,232,0.9);
  }
  .lang-name {
    font-size: 0.7rem;
    font-family: 'DM Mono', monospace;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(245,240,232,0.35);
  }

  /* ── WHAT IT DOES / DOESN'T ── */
  .honest-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    margin-top: 2rem;
  }

  .honest-card {
    border: 1.5px solid var(--rule-heavy);
    border-radius: 3px;
    overflow: hidden;
  }

  .honest-card-head {
    padding: 0.85rem 1.25rem;
    font-family: 'DM Mono', monospace;
    font-size: 0.7rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    border-bottom: 1px solid var(--rule);
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .honest-card-head.does {
    background: rgba(26,107,58,0.07);
    color: var(--green-win);
    border-color: rgba(26,107,58,0.2);
  }
  .honest-card-head.doesnt {
    background: rgba(200,65,10,0.06);
    color: var(--accent);
    border-color: rgba(200,65,10,0.15);
  }

  .honest-list {
    list-style: none;
    padding: 1rem 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }
  .honest-list li {
    font-size: 0.83rem;
    font-weight: 300;
    color: var(--ink-soft);
    display: flex;
    gap: 0.5rem;
    align-items: flex-start;
    line-height: 1.5;
  }
  .honest-list li span.icon { font-size: 0.75rem; margin-top: 0.1rem; flex-shrink: 0; }

  /* ── PRICING ── */
  .pricing-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1px;
    background: var(--rule-heavy);
    border: 1.5px solid var(--rule-heavy);
    border-radius: 3px;
    overflow: hidden;
    margin-top: 2rem;
  }
  @media (max-width: 640px) {
    .pricing-grid {
      grid-template-columns: 1fr;
    }
    .pricing-card {
      padding: 1.5rem 1.2rem;
    }
  }

  .pricing-card {
    background: var(--paper);
    padding: 2rem 1.75rem;
    position: relative;
  }
  .pricing-card.popular { background: var(--ink); }

  .price-tier {
    font-family: 'DM Mono', monospace;
    font-size: 0.65rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    margin-bottom: 0.5rem;
  }
  .pricing-card .price-tier { color: var(--ink-muted); }
  .pricing-card.popular .price-tier { color: rgba(245,240,232,0.4); }

  .price-popular-badge {
    position: absolute;
    top: 1.25rem;
    right: 1.25rem;
    background: var(--accent);
    color: var(--paper);
    font-family: 'DM Mono', monospace;
    font-size: 0.58rem;
    letter-spacing: 0.08em;
    padding: 0.2rem 0.5rem;
    border-radius: 2px;
  }

  .price-amount {
    font-family: 'Playfair Display', serif;
    font-size: 2.4rem;
    font-weight: 900;
    line-height: 1;
    margin-bottom: 0.15rem;
  }
  .pricing-card .price-amount { color: var(--ink); }
  .pricing-card.popular .price-amount { color: var(--paper); }

  .price-per {
    font-size: 0.75rem;
    margin-bottom: 1.5rem;
  }
  .pricing-card .price-per { color: var(--ink-muted); }
  .pricing-card.popular .price-per { color: rgba(245,240,232,0.4); }

  .price-features {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.55rem;
    margin-bottom: 1.75rem;
  }
  .price-features li {
    font-size: 0.82rem;
    font-weight: 300;
    display: flex;
    gap: 0.5rem;
    align-items: flex-start;
    line-height: 1.4;
  }
  .pricing-card .price-features li { color: var(--ink-soft); }
  .pricing-card.popular .price-features li { color: rgba(245,240,232,0.7); }
  .check-icon { color: var(--green-win); font-size: 0.8rem; margin-top: 0.1rem; flex-shrink: 0; }
  .pricing-card.popular .check-icon { color: #4ade80; }

  .price-btn {
    display: block;
    text-align: center;
    padding: 0.7rem;
    border-radius: 2px;
    font-size: 0.85rem;
    font-weight: 500;
    text-decoration: none;
    transition: all 0.2s;
    letter-spacing: 0.02em;
  }
  .price-btn-outline {
    border: 1.5px solid var(--rule-heavy);
    color: var(--ink);
  }
  .price-btn-outline:hover { background: var(--ink); color: var(--paper); }
  .price-btn-solid {
    background: var(--accent);
    color: var(--paper);
    border: 1.5px solid var(--accent);
  }
  .price-btn-solid:hover { background: var(--accent-light); }

  /* ── FAQ ── */
  .faq-list { margin-top: 2rem; border-top: 1.5px solid var(--rule-heavy); }

  details {
    border-bottom: 1px solid var(--rule);
  }

  summary {
    padding: 1.1rem 0;
    font-size: 0.92rem;
    font-weight: 400;
    color: var(--ink);
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    list-style: none;
    transition: color 0.2s;
  }
  summary:hover { color: var(--accent); }
  summary::after {
    content: '+';
    font-family: 'Playfair Display', serif;
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--accent);
    transition: transform 0.2s;
    flex-shrink: 0;
    margin-left: 1rem;
  }
  details[open] summary::after { content: '−'; }

  .faq-answer {
    font-size: 0.85rem;
    color: var(--ink-muted);
    padding-bottom: 1rem;
    padding-right: 2rem;
    line-height: 1.7;
    font-weight: 300;
  }

  /* ── CTA SECTION ── */
  .cta-section {
    background: var(--ink);
    padding: 4rem 2.5rem;
    position: relative;
    overflow: hidden;
  }
  @media (max-width: 900px) {
    .cta-section {
      padding: 3rem 1.1rem;
    }
    .cta-section::before {
      font-size: 8rem;
    }
  }
  .cta-section::before {
    content: 'Story Pulse';
    position: absolute;
    font-family: 'Playfair Display', serif;
    font-size: 14rem;
    font-weight: 900;
    color: rgba(255,255,255,0.025);
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    white-space: nowrap;
    pointer-events: none;
    letter-spacing: -0.05em;
  }
  .cta-inner {
    max-width: 640px;
    margin: 0 auto;
    text-align: center;
    position: relative;
    z-index: 1;
  }
  .cta-inner h2 { color: var(--paper); margin-bottom: 0.75rem; }
  .cta-inner p { color: rgba(245,240,232,0.45); font-size: 0.95rem; margin-bottom: 2rem; }

  .cta-form {
    display: flex;
    gap: 0.5rem;
    justify-content: center;
    flex-wrap: wrap;
    margin-bottom: 1rem;
  }
  .cta-input {
    flex: 1;
    min-width: 220px;
    max-width: 340px;
    padding: 0.75rem 1rem;
    background: rgba(255,255,255,0.07);
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 2px;
    color: var(--paper);
    font-size: 0.88rem;
    font-family: 'DM Sans', sans-serif;
    outline: none;
    transition: border-color 0.2s;
  }
  .cta-input::placeholder { color: rgba(245,240,232,0.25); }
  .cta-input:focus { border-color: var(--accent); }

  .cta-note {
    font-family: 'DM Mono', monospace;
    font-size: 0.65rem;
    color: rgba(245,240,232,0.25);
    letter-spacing: 0.06em;
  }

  /* ── FOOTER ── */
  footer {
    background: #080807;
    border-top: 3px solid var(--accent);
    padding: 2rem 2.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  @media (max-width: 720px) {
    footer {
      padding: 1.5rem 1.1rem;
      flex-direction: column;
      gap: 0.75rem;
      align-items: flex-start;
    }
  }
  .footer-brand {
    font-family: 'Playfair Display', serif;
    font-weight: 900;
    font-size: 1.1rem;
    color: var(--paper);
  }
  .footer-brand span { color: var(--accent); }
  .footer-meta {
    font-family: 'DM Mono', monospace;
    font-size: 0.65rem;
    color: rgba(245,240,232,0.2);
    letter-spacing: 0.06em;
  }
  .footer-email {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.75rem;
    color: rgba(245,240,232,0.4);
    margin-top: 0.5rem;
  }
  .footer-email:hover {
    color: var(--accent);
  }

  /* ── ANIMATIONS ── */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulse-border {
    0%, 100% { border-color: var(--green-win); }
    50% { border-color: rgba(26,107,58,0.4); }
  }
  @keyframes cycle-text {
    0%, 30% { opacity: 1; transform: translateY(0); }
    35%, 65% { opacity: 0; transform: translateY(-8px); }
    70%, 100% { opacity: 1; transform: translateY(0); }
  }

  .hero-left { animation: fadeUp 0.6s ease both; }
  .demo-widget { animation: fadeUp 0.6s 0.2s ease both; }

  .demo-variant.winning {
    animation: pulse-border 2.5s ease-in-out infinite;
  }

  /* ── SCROLL REVEAL ── */
  .reveal {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.5s ease, transform 0.5s ease;
  }
  .reveal.visible {
    opacity: 1;
    transform: translateY(0);
  }

  /* ── RESPONSIVE ── */
  @media (max-width: 900px) {
    .hero { grid-template-columns: 1fr; gap: 2.5rem; }
    .steps-grid { grid-template-columns: 1fr 1fr; }
    .steps-grid .step-cell:nth-child(2n) { border-right: none; }
    .steps-grid .step-cell:nth-child(n+4) { border-bottom: 1px solid var(--rule); }
    .steps-grid .step-cell:nth-child(n+5) { border-bottom: none; }
    .stats-inner { grid-template-columns: repeat(2, 1fr); }
    .stat-item:nth-child(2) { border-right: none; }
    .stat-item:nth-child(1), .stat-item:nth-child(2) { border-bottom: 1px solid rgba(255,255,255,0.08); }
    .honest-grid { grid-template-columns: 1fr; }
    .pricing-grid { grid-template-columns: 1fr; }
    .lang-grid { grid-template-columns: repeat(3, 1fr); }
    nav .nav-links { display: none; }
  }
  @media (max-width: 640px) {
    .hero { gap: 2rem; }
    .steps-grid { grid-template-columns: 1fr; }
    .stats-inner { grid-template-columns: 1fr; }
    .stat-item {
      border-right: none;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      padding: 1rem 0;
    }
    .stat-item:last-child { border-bottom: none; }
    .lang-grid { grid-template-columns: repeat(2, 1fr); }
    .honest-grid { gap: 1rem; }
    .pricing-grid { grid-template-columns: 1fr; }
    .price-popular-badge { top: 1rem; right: 1rem; }
    .cta-form { flex-direction: column; }
    .cta-input {
      min-width: 0;
      max-width: none;
      width: 100%;
    }
  }

</style>
<!-- NAV -->
<nav>
  <a href="#" class="nav-logo">Story<span> Pulse</span></a>
  <ul class="nav-links">
    <li><a href="#how">How it works</a></li>
    <li><a href="#languages">Languages</a></li>
    <li><a href="#pricing">Pricing</a></li>
    <li><a href="#faq">FAQ</a></li>
    <li><a href="/login" class="nav-cta">Start free →</a></li>
  </ul>
</nav>

<!-- DATELINE -->
<div class="dateline">STORY PULSE · AI HEADLINE OPTIMIZER · BUILT FOR INDIAN NEWSROOMS · 9 LANGUAGES · ZERO INTEGRATION</div>

<!-- HERO -->
<div class="hero">
  <div class="hero-left">
    <div class="hero-kicker">Headline intelligence for Indian publishers</div>
    <h1>Paste URL.<br>Get <em>smarter</em><br>headlines.</h1>
    <p class="hero-sub">
      AI generates <strong>platform-specific headlines</strong> for Search, Social &amp; WhatsApp — in Hindi, Tamil, Telugu &amp; 6 more Indian languages. SEO score + FAQ schema in 30 seconds. <strong>Zero integration needed.</strong>
    </p>
    <div class="hero-btns">
      <a href="/login" class="btn-primary">Start free trial →</a>
      <a href="#how" class="btn-ghost">See how it works</a>
    </div>
    <div class="trust-pills">
      <span class="pill">14-day free trial</span>
      <span class="pill">No credit card</span>
      <span class="pill">No code install</span>
      <span class="pill">9 Indian languages</span>
      <span class="pill">₹5,000/month</span>
    </div>
  </div>

  <!-- LIVE DEMO WIDGET -->
  <div class="demo-widget">
    <div class="demo-topbar">
      <div class="demo-dot r"></div>
      <div class="demo-dot y"></div>
      <div class="demo-dot g"></div>
      <span class="demo-url">storypulse.app · live preview</span>
    </div>
    <div class="demo-body">
      <div class="demo-label">Article URL pasted ↓</div>
      <div class="demo-article-title">
        बजट 2026: वित्त मंत्री ने मध्यम वर्ग के लिए टैक्स राहत की घोषणा की
      </div>

      <div class="demo-label">AI-generated headline variants</div>
      <div class="demo-variants">

        <div class="demo-variant">
          <div class="demo-variant-tag">
            <span class="tag-search">🔍 Google Search / Discover</span>
          </div>
          <div class="demo-variant-text">बजट 2026: ₹12 लाख तक की आय पर शून्य टैक्स — जानें पूरी जानकारी</div>
          <div class="demo-score green">SEO Score: 87/100 · Keyword-rich · Number hook</div>
        </div>

        <div class="demo-variant winning">
          <div class="demo-variant-tag">
            <span class="tag-social">⚡ Social Media</span>
            <span class="win-badge">★ Recommended</span>
          </div>
          <div class="demo-variant-text">बजट में बंपर तोहफा! जानिए कितने बचेंगे आपके पैसे 💰</div>
          <div class="demo-score gold">Emotion: High · Shareability: 94 · CTR lift: ~+38%</div>
        </div>

        <div class="demo-variant">
          <div class="demo-variant-tag">
            <span class="tag-whatsapp">💬 WhatsApp Forward</span>
          </div>
          <div class="demo-variant-text">क्या आप भी ₹12 लाख कमाते हैं? तो टैक्स ZERO होगा — आगे भेजें</div>
          <div class="demo-score" style="color:rgba(37,211,102,0.7)">Forward-trigger: ✓ · Personal hook: ✓</div>
        </div>

      </div>
    </div>
    <div class="demo-footer">
      <div class="demo-langs">
        <span class="lang-chip active">हिन्दी</span>
        <span class="lang-chip">தமிழ்</span>
        <span class="lang-chip">తెలుగు</span>
        <span class="lang-chip">ಕನ್ನಡ</span>
        <span class="lang-chip">+5</span>
      </div>
      <span class="demo-processing">Generated in 4.2s</span>
    </div>
  </div>
</div>

<!-- STATS BAR -->
<div class="stats-bar">
  <div class="stats-inner">
    <div class="stat-item">
      <span class="stat-num">9<span>+</span></span>
      <span class="stat-desc">Indian languages supported</span>
    </div>
    <div class="stat-item">
      <span class="stat-num">30<span>s</span></span>
      <span class="stat-desc">Average time per headline set</span>
    </div>
    <div class="stat-item">
      <span class="stat-num">3<span>×</span></span>
      <span class="stat-desc">Platform-specific variants per article</span>
    </div>
    <div class="stat-item">
      <span class="stat-num">₹0</span>
      <span class="stat-desc">Cost to try — 14 days free</span>
    </div>
  </div>
</div>

<!-- HOW IT WORKS -->
<div class="section reveal" id="how">
  <div class="section-eyebrow">How it works</div>
  <h2>Three steps.<br><em>Zero</em> workflow change.</h2>
  <p class="section-sub">No JS snippet. No CMS integration. No IT approval. Just paste a URL and walk away with headlines that work.</p>

  <div class="steps-grid">
    <div class="step-cell">
      <span class="step-num">01</span>
      <div class="step-title">Paste your article URL</div>
      <div class="step-desc">Open Story Pulse, paste any article URL. That's the only step that requires you. We fetch and read the article automatically.</div>
    </div>
    <div class="step-cell">
      <span class="step-num">02</span>
      <div class="step-title">Choose your language</div>
      <div class="step-desc">Select from Hindi, Tamil, Telugu, Kannada, Bengali, Marathi, Malayalam, Gujarati, or English. Headlines generate natively — not translated.</div>
    </div>
    <div class="step-cell">
      <span class="step-num">03</span>
      <div class="step-title">Get 3 platform-tuned headlines</div>
      <div class="step-desc">AI returns one headline each for Google Search/Discover, Social (emotional), and WhatsApp forwarding. With SEO score and FAQ schema.</div>
    </div>
    <div class="step-cell">
      <span class="step-num">04</span>
      <div class="step-title">Pick the best one</div>
      <div class="step-desc">You're the editor. Review the AI suggestions, pick what fits your story and audience, and copy it. One click.</div>
    </div>
    <div class="step-cell">
      <span class="step-num">05</span>
      <div class="step-title">Paste into your CMS</div>
      <div class="step-desc">Update your headline in your existing CMS. Google, Discover, RSS, and social previews all pick up the better headline automatically.</div>
    </div>
    <div class="step-cell">
      <span class="step-num">06</span>
      <div class="step-title">AEO schema ready to copy</div>
      <div class="step-desc">FAQ schema for AI search visibility (Google AI Overviews, ChatGPT citations) is generated automatically with every headline. Paste into your CMS or HTML.</div>
    </div>
  </div>
</div>

<!-- LANGUAGES -->
<div class="lang-section reveal" id="languages">
  <div class="lang-inner">
    <div class="section-eyebrow">9 Indian languages</div>
    <h2 style="color:var(--paper)">Every other tool was<br>built for <em>English.</em></h2>
    <p class="section-sub">We generate headlines natively in Devanagari, Tamil script, Telugu, Kannada, Bengali, Malayalam and Gujarati — the way your editors actually write them. Not transliterated. Not translated. Native.</p>

    <div class="lang-grid">
      <div class="lang-tile"><span class="lang-script">हिन्दी</span><span class="lang-name">Hindi</span></div>
      <div class="lang-tile"><span class="lang-script">தமிழ்</span><span class="lang-name">Tamil</span></div>
      <div class="lang-tile"><span class="lang-script">తెలుగు</span><span class="lang-name">Telugu</span></div>
      <div class="lang-tile"><span class="lang-script">ಕನ್ನಡ</span><span class="lang-name">Kannada</span></div>
      <div class="lang-tile"><span class="lang-script">বাংলা</span><span class="lang-name">Bengali</span></div>
      <div class="lang-tile"><span class="lang-script">मराठी</span><span class="lang-name">Marathi</span></div>
      <div class="lang-tile"><span class="lang-script">മലയാളം</span><span class="lang-name">Malayalam</span></div>
      <div class="lang-tile"><span class="lang-script">ગુજરાતી</span><span class="lang-name">Gujarati</span></div>
      <div class="lang-tile"><span class="lang-script" style="font-family:'DM Sans',sans-serif;font-size:1.2rem;font-weight:500;color:rgba(245,240,232,0.6);">English</span><span class="lang-name">English</span></div>
      <div class="lang-tile" style="background:rgba(200,65,10,0.1);">
        <span class="lang-script" style="font-size:1.1rem;color:var(--accent);">+ More</span>
        <span class="lang-name">Coming soon</span>
      </div>
    </div>
  </div>
</div>

<!-- HONEST SECTION -->
<div class="section reveal">
  <div class="section-eyebrow">Honest transparency</div>
  <h2>What Story Pulse does —<br>and what it <em>doesn't.</em></h2>
  <p class="section-sub">We refuse to over-promise. Here's exactly what you get and what we can't do directly.</p>

  <div class="honest-grid">
    <div class="honest-card">
      <div class="honest-card-head does">✓ &nbsp;What it does</div>
      <ul class="honest-list">
        <li><span class="icon">✓</span> Generates 3 platform-specific headline variants per article</li>
        <li><span class="icon">✓</span> Scores your existing headline for SEO quality (0–100)</li>
        <li><span class="icon">✓</span> Creates FAQ schema for AI search visibility (AEO)</li>
        <li><span class="icon">✓</span> Works in 9 Indian languages natively — not translated</li>
        <li><span class="icon">✓</span> Requires zero CMS integration or JS snippet</li>
        <li><span class="icon">✓</span> Optimises for Google Discover, Social sharing, WhatsApp forwarding</li>
        <li><span class="icon">✓</span> Section-level headline style insights (which style wins in Politics vs Sports)</li>
      </ul>
    </div>
    <div class="honest-card">
      <div class="honest-card-head doesnt">✕ &nbsp;What it doesn't</div>
      <ul class="honest-list">
        <li><span class="icon" style="color:var(--accent)">✕</span> Doesn't guarantee a CTR lift — it suggests; you decide</li>
        <li><span class="icon" style="color:var(--accent)">✕</span> Doesn't auto-publish to your CMS — you copy-paste</li>
        <li><span class="icon" style="color:var(--accent)">✕</span> Doesn't change your Google Search ranking directly</li>
        <li><span class="icon" style="color:var(--accent)">✕</span> Doesn't work on paywalled article URLs</li>
        <li><span class="icon" style="color:var(--accent)">✕</span> Doesn't replace your editors' judgment</li>
      </ul>
    </div>
  </div>
</div>

<!-- PRICING -->
<div class="section reveal" id="pricing" style="background:var(--paper-warm); max-width:100%; padding-left:0; padding-right:0;">
  <div style="max-width:1200px; margin:0 auto; padding:3.5rem 2.5rem;">
    <div class="section-eyebrow">Pricing</div>
    <h2>Built for Indian<br>newsroom <em>budgets.</em></h2>
    <p class="section-sub">14-day free trial on every plan. No credit card required. No hidden setup fees.</p>

    <div class="pricing-grid">
      <div class="pricing-card" style="display:flex; flex-direction:column; height:100%;">
        <div class="price-tier">Starter</div>
        <div class="price-amount">₹5,000</div>
        <div class="price-per">per month · billed monthly</div>
        <ul class="price-features">
          <li><span class="check-icon">✓</span> 2 languages</li>
          <li><span class="check-icon">✓</span> 50 headline sets / month</li>
          <li><span class="check-icon">✓</span> SEO scoring</li>
          <li><span class="check-icon">✓</span> FAQ schema (AEO)</li>
          <li><span class="check-icon">✓</span> Email support</li>
        </ul>
        <a href="https://wa.me/916380992671?text=Hi%20Story%20Pulse%2C%20I%20want%20to%20discuss%20the%20Starter%20plan." target="_blank" rel="noreferrer" class="price-btn price-btn-outline" style="margin-top:auto;">Contact us</a>
      </div>

      <div class="pricing-card popular" style="display:flex; flex-direction:column; height:100%;">
        <span class="price-popular-badge">Most popular</span>
        <div class="price-tier">Growth</div>
        <div class="price-amount">₹12,000</div>
        <div class="price-per">per month · billed monthly</div>
        <ul class="price-features">
          <li><span class="check-icon">✓</span> 5 languages</li>
          <li><span class="check-icon">✓</span> 200 headline sets / month</li>
          <li><span class="check-icon">✓</span> Section-level insights</li>
          <li><span class="check-icon">✓</span> AI style recommendations</li>
          <li><span class="check-icon">✓</span> AEO optimizer</li>
          <li><span class="check-icon">✓</span> Priority support</li>
        </ul>
        <a href="https://wa.me/916380992671?text=Hi%20Story%20Pulse%2C%20I%20want%20to%20discuss%20the%20Growth%20plan." target="_blank" rel="noreferrer" class="price-btn price-btn-solid" style="margin-top:auto;">Contact us</a>
      </div>

      <div class="pricing-card" style="display:flex; flex-direction:column; height:100%;">
        <div class="price-tier">Enterprise</div>
        <div class="price-amount">₹30,000</div>
        <div class="price-per">per month · custom billing</div>
        <ul class="price-features">
          <li><span class="check-icon">✓</span> All 9 languages</li>
          <li><span class="check-icon">✓</span> Unlimited headline sets</li>
          <li><span class="check-icon">✓</span> API access</li>
          <li><span class="check-icon">✓</span> Multi-site dashboard</li>
          <li><span class="check-icon">✓</span> Custom integrations</li>
          <li><span class="check-icon">✓</span> Dedicated account manager</li>
        </ul>
        <a href="https://wa.me/916380992671?text=Hi%20Story%20Pulse%2C%20I%20want%20to%20discuss%20the%20Enterprise%20plan." target="_blank" rel="noreferrer" class="price-btn price-btn-outline" style="margin-top:auto;">Talk to sales</a>
      </div>
    </div>
  </div>
</div>

<!-- FAQ -->
<div class="section reveal" id="faq">
  <div class="section-eyebrow">FAQ</div>
  <h2>Questions Indian<br>editors <em>actually</em> ask.</h2>

  <div class="faq-list">
    <details>
      <summary>Do I need to install anything on my website?</summary>
      <p class="faq-answer">No. Story Pulse is a URL-paste tool. You paste your article URL, get headline suggestions, copy the best one, and paste it into your CMS. No JS snippet, no server-side integration, no IT approval needed. If your editor can use WhatsApp, they can use Story Pulse.</p>
    </details>
    <details>
      <summary>How is this different from Chartbeat or Optimizely?</summary>
      <p class="faq-answer">Chartbeat shows you what's happening (traffic analytics). Optimizely runs A/B tests but requires developer integration and costs $10,000+/year. Story Pulse generates AI-optimised headline options in Indian languages and gives you an SEO score — in 30 seconds, for ₹5,000/month. Different purpose, different audience, different price point.</p>
    </details>
    <details>
      <summary>Are the headlines actually in native script — or translated from English?</summary>
      <p class="faq-answer">Native generation, not translation. The AI is prompted to think in the target language. A Tamil headline isn't an English headline run through Google Translate — it's generated from scratch in Tamil, following Tamil idiom and headline conventions. We've tested this with Tamil and Hindi editors who confirmed the output quality.</p>
    </details>
    <details>
      <summary>Will this improve my Google Discover traffic?</summary>
      <p class="faq-answer">Story Pulse generates one headline specifically optimised for Google Search and Discover — with the right keyword placement and click-signal framing. When you update your CMS headline, Discover picks it up automatically (Discover reads your CMS title tag). We can't guarantee results, but the headline we suggest follows Google's documented best practices for Discover visibility.</p>
    </details>
    <details>
      <summary>What is the AEO / FAQ schema, and do I need it?</summary>
      <p class="faq-answer">AEO (Answer Engine Optimization) is about making your content appear in AI-generated answers — Google AI Overviews, ChatGPT cited sources, Perplexity results. FAQ schema is structured data that helps AI systems identify your content as an authoritative answer. Story Pulse generates this automatically with every headline set. If you're seeing traffic decline from AI search displacing traditional search, AEO is your answer.</p>
    </details>
    <details>
      <summary>What happens after the 14-day free trial?</summary>
      <p class="faq-answer">We'll email you before the trial ends. If you want to continue, you pick a plan and add payment details. If not, no charge, no fuss. We don't auto-bill at trial end — you have to actively subscribe.</p>
    </details>
  </div>
</div>

<!-- CTA -->
<div class="cta-section reveal">
  <div class="cta-inner">
    <div class="section-eyebrow" style="color:var(--gold); justify-content:center; display:flex; align-items:center; gap:0.5rem; margin-bottom:0.6rem;">
      <span style="display:inline-block;width:24px;height:2px;background:var(--gold);"></span>
      Start today
      <span style="display:inline-block;width:24px;height:2px;background:var(--gold);"></span>
    </div>
    <h2>Better headlines.<br><em>More clicks.</em><br>In your language.</h2>
    <p>14 days free. Every feature. No credit card. Onboarding call included.</p>
    <div class="cta-form">
      <input class="cta-input" type="email" placeholder="editor@yournewsroom.com" />
      <a href="/login" class="btn-primary">Start free trial →</a>
    </div>
    <div class="cta-note">NO CREDIT CARD · NO CODE INSTALL · CANCEL ANYTIME</div>
  </div>
</div>

<!-- FOOTER -->
<footer>
  <div class="footer-brand">Story<span> Pulse</span></div>
  <div class="footer-meta">© 2026 STORY PULSE · BUILT FOR INDIAN NEWSROOMS · CHENNAI</div>
  <a href="mailto:info@storypulse.co" class="footer-email">info@storypulse.co</a>
</footer>
`;

function Landing() {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          observer.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

    const processing = document.querySelector(".demo-processing") as HTMLElement | null;
    if (!processing) return () => observer.disconnect();
    const states = ["Generated in 4.2s", "Analyzing article…", "Generating variants…", "Done in 3.8s"];
    let si = 0;
    processing.style.transition = "opacity 0.3s";
    const id = setInterval(() => {
      si = (si + 1) % states.length;
      processing.style.opacity = "0";
      setTimeout(() => {
        processing.textContent = states[si];
        processing.style.opacity = "1";
      }, 300);
    }, 3000);
    return () => {
      observer.disconnect();
      clearInterval(id);
    };
  }, []);

  return <div dangerouslySetInnerHTML={{ __html: HTML }} />;
}
