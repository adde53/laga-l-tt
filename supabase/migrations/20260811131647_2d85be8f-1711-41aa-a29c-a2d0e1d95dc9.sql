-- Unsubscribe support
ALTER TABLE public.newsletter_subscribers
  ADD COLUMN IF NOT EXISTS unsubscribe_token uuid NOT NULL DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS unsubscribed_at timestamptz;

CREATE UNIQUE INDEX IF NOT EXISTS newsletter_subscribers_unsubscribe_token_key
  ON public.newsletter_subscribers (unsubscribe_token);

-- Automation bookkeeping on settings
ALTER TABLE public.newsletter_settings
  ADD COLUMN IF NOT EXISTS auto_send boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS require_approval boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS timezone text NOT NULL DEFAULT 'Europe/Stockholm',
  ADD COLUMN IF NOT EXISTS last_auto_run_at timestamptz,
  ADD COLUMN IF NOT EXISTS cron_secret text NOT NULL DEFAULT encode(gen_random_bytes(24), 'hex');

-- Make sure a settings row exists
INSERT INTO public.newsletter_settings (send_day, send_hour, send_minute)
SELECT 1, 8, 0
WHERE NOT EXISTS (SELECT 1 FROM public.newsletter_settings);

-- Admins must not be able to read the cron secret from the client.
REVOKE ALL ON public.newsletter_settings FROM anon, authenticated;
GRANT SELECT (id, send_day, send_hour, send_minute, auto_send, require_approval, timezone, last_auto_run_at, updated_at, updated_by) ON public.newsletter_settings TO authenticated;
GRANT UPDATE (send_day, send_hour, send_minute, auto_send, require_approval, updated_at, updated_by) ON public.newsletter_settings TO authenticated;
GRANT ALL ON public.newsletter_settings TO service_role;

-- Weekly automation: check every minute whether it is time to send
SELECT cron.unschedule('newsletter-auto-send') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'newsletter-auto-send'
);

SELECT cron.schedule(
  'newsletter-auto-send',
  '* * * * *',
  $$
  SELECT net.http_post(
    url := 'https://lyjgjuhshxbfolloscyl.supabase.co/functions/v1/newsletter-cron',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', (SELECT cron_secret FROM public.newsletter_settings LIMIT 1)
    ),
    body := '{}'::jsonb
  );
  $$
);