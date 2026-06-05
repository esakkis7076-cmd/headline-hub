import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Copy, Check, LogOut } from "lucide-react";
import { getMyWorkspace } from "@/lib/workspace.functions";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
  head: () => ({ meta: [{ title: "Settings — TestKaro" }] }),
});

function SettingsPage() {
  const { user } = useAuth();
  const fetchWs = useServerFn(getMyWorkspace);
  const ws = useQuery({ queryKey: ["workspace"], queryFn: () => fetchWs() });

  const pub = ws.data?.publication;
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  const snippet = pub
    ? `<!-- TestKaro tracking snippet -->
<script>
  (function(){
    window.tkConfig = { pubId: "${pub.id}", endpoint: "${origin}/api/public/track" };
    var s = document.createElement("script");
    s.async = true;
    s.src = "${origin}/tk.js";
    document.head.appendChild(s);
  })();
</script>`
    : "";

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="font-serif text-3xl font-semibold tracking-tight">Settings</h1>

      <section className="mt-8 rounded-2xl border border-border/60 bg-card/30 p-6">
        <h2 className="font-semibold">Account</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between"><dt className="text-muted-foreground">Email</dt><dd>{user?.email}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">Display name</dt><dd>{ws.data?.profile?.display_name ?? "—"}</dd></div>
        </dl>
      </section>

      <section className="mt-6 rounded-2xl border border-border/60 bg-card/30 p-6">
        <h2 className="font-semibold">Publication</h2>
        {pub ? (
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Name</dt><dd>{pub.name}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Domain</dt><dd>{pub.domain ?? "—"}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Default language</dt><dd className="uppercase">{pub.default_language}</dd></div>
          </dl>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">No publication yet — visit the Dashboard to create one.</p>
        )}
      </section>

      {pub && (
        <section className="mt-6 rounded-2xl border border-border/60 bg-card/30 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-semibold">Install snippet</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Paste this code inside the <code className="rounded bg-muted px-1 py-0.5 text-xs">&lt;head&gt;</code> of every page on your website to enable headline tests and AEO tracking.
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-3 text-sm">
            <CopyRow label="Publication ID" value={pub.id} />
            <CopyRow label="Tracking endpoint" value={`${origin}/api/public/track`} />
          </div>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium">Embed code</span>
              <CopyButton text={snippet} label="Copy snippet" />
            </div>
            <pre className="overflow-x-auto rounded-lg border border-border/60 bg-muted/40 p-4 text-xs leading-relaxed">
              <code>{snippet}</code>
            </pre>
          </div>

          <p className="mt-3 text-xs text-muted-foreground">
            Need help? Share this page with your web developer — they only need to add the snippet once.
          </p>
        </section>
      )}
    </div>
  );
}

function CopyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border/40 bg-background/40 px-3 py-2">
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="truncate font-mono text-xs">{value}</div>
      </div>
      <CopyButton text={value} />
    </div>
  );
}

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          toast.success("Copied to clipboard");
          setTimeout(() => setCopied(false), 1500);
        } catch {
          toast.error("Copy failed");
        }
      }}
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {label && <span className="ml-1.5">{label}</span>}
    </Button>
  );
}
