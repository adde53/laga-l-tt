CREATE TABLE public.store_locations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chain text NOT NULL,
  store_id text NOT NULL DEFAULT '',
  name text NOT NULL,
  town text,
  last_requested_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (chain, store_id)
);

GRANT SELECT ON public.store_locations TO anon, authenticated;
GRANT ALL ON public.store_locations TO service_role;
ALTER TABLE public.store_locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read store locations" ON public.store_locations FOR SELECT USING (true);

CREATE TABLE public.store_deals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chain text NOT NULL,
  store_id text NOT NULL DEFAULT '',
  store_name text NOT NULL,
  week_start date NOT NULL,
  source text,
  deal_count integer NOT NULL DEFAULT 0,
  deals jsonb NOT NULL DEFAULT '[]'::jsonb,
  deals_text text,
  fetched_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (chain, store_id)
);

CREATE INDEX store_deals_week_idx ON public.store_deals (week_start);
GRANT SELECT ON public.store_deals TO anon, authenticated;
GRANT ALL ON public.store_deals TO service_role;
ALTER TABLE public.store_deals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read store deals" ON public.store_deals FOR SELECT USING (true);

CREATE TABLE public.store_deals_settings (
  id integer NOT NULL PRIMARY KEY DEFAULT 1,
  enabled boolean NOT NULL DEFAULT true,
  active_days integer NOT NULL DEFAULT 60,
  last_run_at timestamptz,
  cron_secret text NOT NULL DEFAULT encode(extensions.gen_random_bytes(24), 'hex'),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT store_deals_settings_single_row CHECK (id = 1)
);

GRANT ALL ON public.store_deals_settings TO service_role;
ALTER TABLE public.store_deals_settings ENABLE ROW LEVEL SECURITY;

INSERT INTO public.store_deals_settings (id) VALUES (1);