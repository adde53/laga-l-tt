-- Veckans butikserbjudanden lagras i databasen i stallet for att hamtas live
-- vid varje forfragan. Ett cron-jobb uppdaterar dem varje mandag och raden for
-- en butik skrivs over nar den nya veckans erbjudanden hamtas.

-- ---------------------------------------------------------------------------
-- Butiker vi kanner till
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.store_locations (
  chain             text        NOT NULL,
  -- Butiks-ID (Axfood) eller URL-slug (ICA). Tom strang for rikstackande kedjor.
  store_id          text        NOT NULL DEFAULT '',
  name              text        NOT NULL,
  town              text,
  -- Satts nar en anvandare faktiskt hamtar butikens erbjudanden. Endast butiker
  -- som anvands pa riktigt tas med i den veckovisa uppdateringen.
  last_requested_at timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (chain, store_id)
);

COMMENT ON COLUMN public.store_locations.last_requested_at IS
  'NULL = butiken har aldrig efterfragats och hamtas darfor inte veckovis.';

CREATE INDEX IF NOT EXISTS store_locations_last_requested_idx
  ON public.store_locations (last_requested_at DESC NULLS LAST);

-- ---------------------------------------------------------------------------
-- Veckans erbjudanden - en rad per butik som skrivs over varje vecka
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.store_deals (
  chain      text        NOT NULL,
  store_id   text        NOT NULL DEFAULT '',
  store_name text        NOT NULL,
  -- Mandagen i den vecka erbjudandena galler.
  week_start date        NOT NULL,
  source     text        NOT NULL CHECK (source IN ('native', 'firecrawl')),
  deal_count integer     NOT NULL DEFAULT 0,
  deals      jsonb       NOT NULL DEFAULT '[]'::jsonb,
  -- Fardigformaterad markdown som skickas till AI-modellen.
  deals_text text        NOT NULL DEFAULT '',
  fetched_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (chain, store_id)
);

CREATE INDEX IF NOT EXISTS store_deals_week_idx ON public.store_deals (week_start);

-- ---------------------------------------------------------------------------
-- Installningar for cron-jobbet
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.store_deals_settings (
  id          integer     PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  enabled     boolean     NOT NULL DEFAULT true,
  -- Butiker som inte efterfragats pa sa har lange slutar uppdateras veckovis.
  active_days integer     NOT NULL DEFAULT 60,
  last_run_at timestamptz,
  cron_secret text        NOT NULL DEFAULT encode(gen_random_bytes(24), 'hex')
);

INSERT INTO public.store_deals_settings (id)
SELECT 1 WHERE NOT EXISTS (SELECT 1 FROM public.store_deals_settings);

-- ---------------------------------------------------------------------------
-- Atkomst
-- ---------------------------------------------------------------------------
ALTER TABLE public.store_deals          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_locations      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_deals_settings ENABLE ROW LEVEL SECURITY;

-- Erbjudanden och butiker ar offentlig information - alla far lasa.
DROP POLICY IF EXISTS "Erbjudanden ar publika" ON public.store_deals;
CREATE POLICY "Erbjudanden ar publika"
  ON public.store_deals FOR SELECT USING (true);

DROP POLICY IF EXISTS "Butiker ar publika" ON public.store_locations;
CREATE POLICY "Butiker ar publika"
  ON public.store_locations FOR SELECT USING (true);

-- Skrivning sker enbart via edge-funktionerna (service_role kringgar RLS).
GRANT SELECT ON public.store_deals, public.store_locations TO anon, authenticated;
GRANT ALL    ON public.store_deals, public.store_locations TO service_role;

-- Cron-hemligheten far aldrig lasas fran klienten.
REVOKE ALL ON public.store_deals_settings FROM anon, authenticated;
GRANT ALL  ON public.store_deals_settings TO service_role;

-- ---------------------------------------------------------------------------
-- Veckovis uppdatering
-- ---------------------------------------------------------------------------
-- Funktionen uppdaterar ett begransat antal butiker per anrop och hoppar over
-- butiker som redan har innevarande veckas data. Darfor kors den upprepat under
-- mandagsmorgonen tills allt ar uppdaterat - da blir efterfoljande korningar
-- verkningslosa. Det gor jobbet sjalvlakande och okansligt for sommartid.
SELECT cron.unschedule('store-deals-weekly-refresh') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'store-deals-weekly-refresh'
);

SELECT cron.schedule(
  'store-deals-weekly-refresh',
  -- Var 15:e minut mellan 01:00 och 08:00 UTC pa mandagar.
  '*/15 1-8 * * 1',
  $$
  SELECT net.http_post(
    url := 'https://lyjgjuhshxbfolloscyl.supabase.co/functions/v1/refresh-store-deals',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', (SELECT cron_secret FROM public.store_deals_settings LIMIT 1)
    ),
    body := '{}'::jsonb
  );
  $$
);

