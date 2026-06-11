-- Hide internal cost/supplier columns from anonymous (public) reads.
-- Authenticated keeps access so admin panel (admin role enforced by RLS) can edit.
REVOKE SELECT (cost, supplier_id, supplier_url) ON public.products FROM anon;
