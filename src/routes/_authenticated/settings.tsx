import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getMyWorkspace } from "@/lib/workspace.functions";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
  head: () => ({ meta: [{ title: "Settings — TestKaro" }] }),
});

function SettingsPage() {
  const { user } = useAuth();
  const fetchWs = useServerFn(getMyWorkspace);
  const ws = useQuery({ queryKey: ["workspace"], queryFn: () => fetchWs() });

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
        {ws.data?.publication ? (
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Name</dt><dd>{ws.data.publication.name}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Domain</dt><dd>{ws.data.publication.domain ?? "—"}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Default language</dt><dd className="uppercase">{ws.data.publication.default_language}</dd></div>
          </dl>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">No publication yet — visit the Dashboard to create one.</p>
        )}
      </section>
    </div>
  );
}
