import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const LANGS = ["hi", "bn", "ta", "te", "mr", "gu", "kn", "ml", "pa", "en"] as const;

export const getMyWorkspace = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const claims = context.claims as {
      email?: string;
      user_metadata?: { full_name?: string; name?: string };
    };

    let { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (!profile) {
      const { data: ownedPublication } = await supabase
        .from("publications")
        .select("*")
        .eq("owner_id", userId)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      const { data: restoredProfile, error: restoreError } = await supabase
        .from("profiles")
        .upsert(
          {
            user_id: userId,
            email: claims.email ?? null,
            display_name: claims.user_metadata?.full_name ?? claims.user_metadata?.name ?? null,
            publication_id: ownedPublication?.id ?? null,
          },
          { onConflict: "user_id" },
        )
        .select("*")
        .single();
      if (restoreError) throw new Error(restoreError.message);
      profile = restoredProfile;
    }

    let publication = null;
    if (profile?.publication_id) {
      const { data: pub } = await supabase
        .from("publications")
        .select("*")
        .eq("id", profile.publication_id)
        .maybeSingle();
      publication = pub;
    }

    return { profile, publication };
  });

export const createPublication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        name: z.string().min(1).max(200),
        domain: z.string().max(200).optional().nullable(),
        default_language: z.enum(LANGS).default("hi"),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const claims = context.claims as {
      email?: string;
      user_metadata?: { full_name?: string; name?: string };
    };

    const { data: pub, error } = await supabase
      .from("publications")
      .insert({
        name: data.name,
        domain: data.domain || null,
        default_language: data.default_language,
        owner_id: userId,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);

    const { error: profileError } = await supabase
      .from("profiles")
      .upsert(
        {
          user_id: userId,
          email: claims.email ?? null,
          display_name: claims.user_metadata?.full_name ?? claims.user_metadata?.name ?? null,
          publication_id: pub.id,
          preferred_language: data.default_language,
        },
        { onConflict: "user_id" },
      );
    if (profileError) throw new Error(profileError.message);

    return { publication: pub };
  });

export const seedDemoData = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const { data: profile } = await supabase
      .from("profiles")
      .select("publication_id")
      .eq("user_id", userId)
      .maybeSingle();
    if (!profile?.publication_id) throw new Error("Create a publication first");
    const pubId = profile.publication_id;

    const seeds = [
      {
        article_url: "https://example.in/politics/election-results-2026",
        article_title: "Election results 2026 — full breakdown",
        section: "Politics",
        language: "hi" as const,
        variants: [
          { label: "A", text: "चुनाव परिणाम 2026: कौन जीता, कौन हारा", control: true, imp: 12450, clicks: 1320 },
          { label: "B", text: "क्या यह नतीजा देश की राजनीति बदल देगा?", control: false, imp: 12380, clicks: 1612 },
          { label: "C", text: "2026 के चुनाव: 5 बड़े झटके जो किसी ने नहीं देखे", control: false, imp: 12410, clicks: 1789 },
        ],
      },
      {
        article_url: "https://example.in/sports/india-vs-australia-final",
        article_title: "India vs Australia final highlights",
        section: "Sports",
        language: "ta" as const,
        variants: [
          { label: "A", text: "இந்தியா vs ஆஸ்திரேலியா இறுதிப் போட்டி", control: true, imp: 8400, clicks: 980 },
          { label: "B", text: "கடைசி ஓவரில் இந்தியா செய்த அதிசயம்", control: false, imp: 8520, clicks: 1410 },
        ],
      },
      {
        article_url: "https://example.in/business/sensex-record-high",
        article_title: "Sensex hits record high",
        section: "Business",
        language: "en" as const,
        variants: [
          { label: "A", text: "Sensex hits record high above 85,000", control: true, imp: 5200, clicks: 460 },
          { label: "B", text: "5 stocks that drove the Sensex to its biggest day of 2026", control: false, imp: 5310, clicks: 712 },
        ],
      },
    ];

    for (const seed of seeds) {
      const { data: test, error: testErr } = await supabase
        .from("headline_tests")
        .insert({
          publication_id: pubId,
          created_by: userId,
          article_url: seed.article_url,
          article_title: seed.article_title,
          section: seed.section,
          language: seed.language,
          status: "completed",
          started_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
          ended_at: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
        })
        .select()
        .single();
      if (testErr) throw new Error(testErr.message);

      const variantRows = seed.variants.map((v) => ({
        test_id: test.id,
        variant_label: v.label,
        headline_text: v.text,
        is_control: v.control,
        impressions: v.imp,
        clicks: v.clicks,
        ctr: Number((v.clicks / v.imp).toFixed(4)),
        avg_dwell_time_sec: 18 + Math.random() * 20,
      }));
      const { data: variants, error: varErr } = await supabase
        .from("headline_variants")
        .insert(variantRows)
        .select();
      if (varErr) throw new Error(varErr.message);

      const winner = variants.reduce((a, b) => (a.ctr > b.ctr ? a : b));
      await supabase
        .from("headline_tests")
        .update({ winner_variant_id: winner.id })
        .eq("id", test.id);
    }

    return { ok: true, created: seeds.length };
  });
