import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { TKLogo } from "@/components/marketing/TKLogo";
import { Sparkles, LogOut, Settings, Menu, X, Shield } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

const NAV_ITEMS = [
  { to: "/aeo", label: "AEO analyzer", icon: Sparkles },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

const ADMIN_EMAIL = "esakkis7076@gmail.com";

function AuthenticatedLayout() {
  const { loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate({ to: "/login" });
    }
  }, [loading, isAuthenticated, navigate]);

  useEffect(() => {
    setMobileOpen(false);
  }, [path]);

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground md:flex">
      <Sidebar />
      <MobileBar onOpen={() => setMobileOpen(true)} />
      {mobileOpen && <MobileDrawer onClose={() => setMobileOpen(false)} />}
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}

function NavList({ pathname, email, onClick }: { pathname: string; email?: string | null; onClick?: () => void }) {
  const items = [
    ...NAV_ITEMS,
    ...(email === ADMIN_EMAIL ? [{ to: "/admin" as const, label: "Admin", icon: Shield }] : []),
  ];
  return (
    <nav className="flex flex-col gap-1">
      {items.map((it) => {
        const active = pathname === it.to || pathname.startsWith(it.to + "/");
        const Icon = it.icon;
        return (
          <Link
            key={it.to}
            to={it.to}
            onClick={onClick}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
              active
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            <Icon size={16} />
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}

function SignOutButton() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const handle = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/login", replace: true });
  };
  return (
    <button
      onClick={handle}
      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition"
    >
      <LogOut size={16} />
      Sign out
    </button>
  );
}

function Sidebar() {
  const { user } = useAuth();
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-border/60 bg-card/30 backdrop-blur p-4">
      <div className="px-2 py-2"><TKLogo /></div>
      <div className="mt-6"><NavList pathname={path} email={user?.email} /></div>
      <div className="mt-auto border-t border-border/60 pt-4">
        <div className="px-2 text-xs text-muted-foreground truncate">{user?.email}</div>
        <div className="mt-2"><SignOutButton /></div>
      </div>
    </aside>
  );
}

function MobileBar({ onOpen }: { onOpen: () => void }) {
  return (
    <header className="md:hidden sticky top-0 z-30 flex items-center justify-between border-b border-border/60 bg-background/85 backdrop-blur px-4 py-3">
      <TKLogo />
      <button
        onClick={onOpen}
        aria-label="Open menu"
        className="rounded-md border border-border bg-card p-2 text-muted-foreground"
      >
        <Menu size={18} />
      </button>
    </header>
  );
}

function MobileDrawer({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="md:hidden fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-background/70 backdrop-blur" onClick={onClose} />
      <aside className="relative w-72 max-w-[85%] h-full border-r border-border/60 bg-card p-4 flex flex-col">
        <div className="flex items-center justify-between">
          <TKLogo />
          <button onClick={onClose} aria-label="Close menu" className="text-muted-foreground"><X size={18} /></button>
        </div>
        <div className="mt-6"><NavList pathname={path} email={user?.email} onClick={onClose} /></div>
        <div className="mt-auto border-t border-border/60 pt-4">
          <div className="px-2 text-xs text-muted-foreground truncate">{user?.email}</div>
          <div className="mt-2"><SignOutButton /></div>
        </div>
      </aside>
    </div>
  );
}
