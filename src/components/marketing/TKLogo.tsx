import { Link } from "@tanstack/react-router";

export function TKLogo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`inline-flex items-center ${className}`} aria-label="Story Pulse">
      <img
        src="/logo-full-dark.png"
        alt="Story Pulse"
        className="h-9 w-auto max-w-[160px] object-contain"
      />
    </Link>
  );
}
