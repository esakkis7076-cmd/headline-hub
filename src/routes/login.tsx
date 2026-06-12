import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

import { TKLogo } from "@/components/marketing/TKLogo";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [
      { title: "Sign in — TestKaro" },
      { name: "description", content: "Sign in to TestKaro to run headline A/B tests and AEO analyses for your newsroom." },
    ],
  }),
});

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/aeo" });
    });
  }, [navigate]);

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      const cleanName = name.trim();

      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/aeo`,
            data: { full_name: cleanName },
          },
        });
        if (error) throw error;
        const successText = "Account created. Check your email to confirm, then sign in.";
        setMessage({ type: "success", text: successText });
        toast.success(successText);
        setMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
        if (error) throw error;
        navigate({ to: "/aeo" });
      }
    } catch (err) {
      const rawMessage = err instanceof Error ? err.message : "Authentication failed";
      const friendlyMessage = rawMessage.toLowerCase().includes("weak") || rawMessage.toLowerCase().includes("password")
        ? `${rawMessage} Try a stronger, unique password.`
        : rawMessage;
      setMessage({ type: "error", text: friendlyMessage });
      toast.error(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-8"><TKLogo /></div>
        <div className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur p-8 shadow-2xl">
          <h1 className="font-serif text-3xl font-semibold tracking-tight">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "signin"
              ? "Sign in to run headline tests and AEO analyses."
              : "Start testing headlines in 9 Indian languages."}
          </p>

          <div className="mt-6" />



          <form onSubmit={handleEmail} className="space-y-3">
            {mode === "signup" && (
              <input
                type="text"
                required
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
              />
            )}
            <input
              type="email"
              required
              autoComplete="email"
              placeholder="work@yourpublication.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
            />
            <input
              type="password"
              required
              minLength={6}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
            />
            {message && (
              <p
                role="status"
                className={`rounded-lg border px-3 py-2 text-sm ${
                  message.type === "success"
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-destructive/40 bg-destructive/10 text-destructive"
                }`}
              >
                {message.text}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition disabled:opacity-50"
            >
              {loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signin" ? "New to TestKaro? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="text-primary hover:underline font-medium"
            >
              {mode === "signin" ? "Create an account" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
