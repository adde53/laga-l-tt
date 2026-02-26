CREATE POLICY "Admins can read subscribers"
  ON public.newsletter_subscribers
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));