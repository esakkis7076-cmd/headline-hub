import { TKLogo } from "./TKLogo";

export function SiteNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
        <TKLogo />
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#how" className="hover:text-foreground transition">How it works</a>
          <a href="#languages" className="hover:text-foreground transition">Languages</a>
          <a href="#sections" className="hover:text-foreground transition">Section insights</a>
          <a href="#pricing" className="hover:text-foreground transition">Pricing</a>
          <a href="#faq" className="hover:text-foreground transition">FAQ</a>
        </nav>
        <div className="flex items-center gap-2">
          <a
            href="#waitlist"
            className="hidden text-sm text-muted-foreground hover:text-foreground sm:inline"
          >
            Sign in
          </a>
          <a
            href="#waitlist"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary-light"
          >
            Start free trial
          </a>
        </div>
      </div>
    </header>
  );
}
