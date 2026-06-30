import { Link } from "@tanstack/react-router";

export function TKLogo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`group inline-flex items-center gap-2 ${className}`}>
      <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground font-display text-lg font-bold shadow-[0_0_24px_-4px_oklch(0.72_0.17_158/0.6)]">
        T
      </div>
      <span className="font-display text-xl font-semibold tracking-tight">
        Story Pulse
      </span>
    </Link>
  );
}
