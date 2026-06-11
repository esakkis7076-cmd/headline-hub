// One-time seed endpoint to create the local admin user.
// Idempotent: if an admin already exists, it returns { status: "exists" }
// and does nothing. Safe to leave deployed.
//
// Usage: GET /api/public/seed-admin
// Creates: admin@test.io / password   (role: admin)

import { createFileRoute } from "@tanstack/react-router";

const ADMIN_EMAIL = "admin@test.io";
const ADMIN_PASSWORD = "password";

export const Route = createFileRoute("/api/public/seed-admin")({
  server: {
    handlers: {
      GET: async () => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        // Idempotency guard: if any admin role row exists, exit.
        const { data: existingAdmins, error: adminCheckErr } = await supabaseAdmin
          .from("user_roles")
          .select("user_id")
          .eq("role", "admin")
          .limit(1);
        if (adminCheckErr) {
          return new Response(JSON.stringify({ error: adminCheckErr.message }), {
            status: 500,
            headers: { "content-type": "application/json" },
          });
        }
        if (existingAdmins && existingAdmins.length > 0) {
          return new Response(
            JSON.stringify({ status: "exists", message: "An admin already exists." }),
            { status: 200, headers: { "content-type": "application/json" } },
          );
        }

        // Create (or find) the auth user.
        let userId: string | null = null;
        const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
          email_confirm: true,
          user_metadata: { full_name: "Local Admin" },
        });

        if (createErr) {
          // If the user already exists in auth, look them up via listUsers.
          const msg = createErr.message?.toLowerCase() ?? "";
          if (msg.includes("already") || msg.includes("registered") || msg.includes("exists")) {
            const { data: list, error: listErr } = await supabaseAdmin.auth.admin.listUsers({
              page: 1,
              perPage: 200,
            });
            if (listErr) {
              return new Response(JSON.stringify({ error: listErr.message }), {
                status: 500,
                headers: { "content-type": "application/json" },
              });
            }
            const found = list.users.find((u) => u.email?.toLowerCase() === ADMIN_EMAIL);
            if (!found) {
              return new Response(
                JSON.stringify({ error: "Auth user exists but could not be located." }),
                { status: 500, headers: { "content-type": "application/json" } },
              );
            }
            userId = found.id;
          } else {
            return new Response(JSON.stringify({ error: createErr.message }), {
              status: 500,
              headers: { "content-type": "application/json" },
            });
          }
        } else {
          userId = created.user?.id ?? null;
        }

        if (!userId) {
          return new Response(JSON.stringify({ error: "No user id resolved." }), {
            status: 500,
            headers: { "content-type": "application/json" },
          });
        }

        // Grant admin role (idempotent due to unique (user_id, role)).
        const { error: roleErr } = await supabaseAdmin
          .from("user_roles")
          .upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id,role" });
        if (roleErr) {
          return new Response(JSON.stringify({ error: roleErr.message }), {
            status: 500,
            headers: { "content-type": "application/json" },
          });
        }

        return new Response(
          JSON.stringify({
            status: "created",
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD,
            message: "Admin created. Sign in at /login.",
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      },
    },
  },
});
