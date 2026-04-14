CREATE OR REPLACE FUNCTION public.get_secret(secret_name text)
RETURNS TABLE (decrypted_secret text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT ds.decrypted_secret
  FROM vault.decrypted_secrets ds
  WHERE ds.name = secret_name
  LIMIT 1;
END;
$$;

REVOKE ALL ON FUNCTION public.get_secret(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_secret(text) FROM anon;
REVOKE ALL ON FUNCTION public.get_secret(text) FROM authenticated;