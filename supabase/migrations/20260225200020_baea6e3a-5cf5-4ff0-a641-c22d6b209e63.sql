
CREATE TABLE public.featured_recipes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  total_cost integer NOT NULL,
  cost_per_portion integer,
  cook_time_minutes integer NOT NULL,
  ingredient_count integer NOT NULL,
  cuisine text,
  servings integer NOT NULL DEFAULT 4,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.featured_recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read featured recipes" ON public.featured_recipes
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage featured recipes" ON public.featured_recipes
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

INSERT INTO public.featured_recipes (title, description, total_cost, cost_per_portion, cook_time_minutes, ingredient_count, cuisine, servings) VALUES
  ('Krämig kycklingpasta med citron', 'Snabb och smakrik pasta med kyckling, vitlök och en krämig citronsås. Perfekt vardagsrätt som hela familjen älskar.', 89, 22, 25, 7, 'Italienskt', 4),
  ('Vegansk linssoppa med kokosmjölk', 'Värmande och mättande soppa med röda linser, kokosmjölk och curry. Billig, nyttig och otroligt god.', 52, 13, 30, 9, 'Indiskt', 4),
  ('Ugnsbakad lax med honungssoja', 'Enkel men elegant laxrätt med en söt och salt honungssoja-glaze. Serveras med ris och ångade grönsaker.', 119, 30, 20, 6, 'Asiatiskt', 4),
  ('Klassisk köttfärssås med pasta', 'Riktig husmanskost – en långkokt köttfärssås med morötter, selleri och tomater. Bäst med spaghetti.', 78, 20, 40, 10, 'Svenskt', 4),
  ('Halloumi-bowl med quinoa', 'Fräsch och mättande bowl med grillad halloumi, quinoa, avokado och en lime-dressing.', 95, 24, 20, 8, 'Medelhavs', 4),
  ('Pannkakor med bär och grädde', 'Fluffiga svenska pannkakor med färska bär och vispad grädde. Perfekt för en lättlagad middag.', 45, 11, 15, 5, 'Svenskt', 4);
