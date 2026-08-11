import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, json } from "../_shared/newsletter.ts";

/**
 * Runs every minute (pg_cron). Sends the weekly newsletter when the configured
 * weekday/time is reached in the configured timezone.
 */
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const { data: settings } = await supabase
      .from("newsletter_settings")
      .select("*")
      .limit(1)
      .maybeSingle();
    if (!settings) return json({ skipped: "no_settings" });

    const secret = req.headers.get("x-cron-secret");
    if (!secret || secret !== settings.cron_secret) return json({ error: "Unauthorized" }, 401);

    if (!settings.auto_send) return json({ skipped: "auto_send_disabled" });

    // Local time in the configured timezone
    const tz = settings.timezone || "Europe/Stockholm";
    const now = new Date();
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(now);
    const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
    const weekdayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    const day = weekdayMap[get("weekday")];
    const hour = parseInt(get("hour"), 10) % 24;
    const minute = parseInt(get("minute"), 10);

    const isTime =
      day === settings.send_day &&
      hour === settings.send_hour &&
      minute >= settings.send_minute &&
      minute < settings.send_minute + 5; // small window in case a run is missed

    if (!isTime) return json({ skipped: "not_scheduled_time", day, hour, minute });

    // Only once per scheduled slot
    if (settings.last_auto_run_at) {
      const hoursSince = (now.getTime() - new Date(settings.last_auto_run_at).getTime()) / 3600000;
      if (hoursSince < 24) return json({ skipped: "already_ran", hoursSince });
    }

    await supabase
      .from("newsletter_settings")
      .update({ last_auto_run_at: now.toISOString() })
      .eq("id", settings.id);

    // Pick a sendable draft
    const allowedStatuses = settings.require_approval ? ["approved"] : ["approved", "draft"];
    let { data: drafts } = await supabase
      .from("newsletter_drafts")
      .select("id, status, created_at")
      .in("status", allowedStatuses)
      .order("created_at", { ascending: false })
      .limit(1);

    // Nothing ready? Generate a fresh one now.
    if (!drafts || drafts.length === 0) {
      if (settings.require_approval) return json({ skipped: "no_approved_draft" });

      const genRes = await fetch(`${supabaseUrl}/functions/v1/generate-newsletter-draft`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-cron-secret": settings.cron_secret },
        body: "{}",
      });
      const genBody = await genRes.json().catch(() => ({}));
      if (!genRes.ok || !genBody?.draft?.id) {
        console.error("draft generation failed", genRes.status, genBody);
        return json({ error: "draft_generation_failed", details: genBody }, 502);
      }
      drafts = [{ id: genBody.draft.id, status: "draft", created_at: now.toISOString() }];
    }

    const sendRes = await fetch(`${supabaseUrl}/functions/v1/send-newsletter`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-cron-secret": settings.cron_secret },
      body: JSON.stringify({ draftId: drafts[0].id }),
    });
    const sendBody = await sendRes.json().catch(() => ({}));
    if (!sendRes.ok) {
      console.error("send failed", sendRes.status, sendBody);
      return json({ error: "send_failed", details: sendBody }, 502);
    }

    return json({ success: true, draftId: drafts[0].id, ...sendBody });
  } catch (e) {
    console.error("newsletter-cron error:", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});