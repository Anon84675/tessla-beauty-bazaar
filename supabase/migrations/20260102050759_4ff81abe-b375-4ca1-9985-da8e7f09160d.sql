-- Add RLS policies for products storage bucket
-- Allow anyone to view public product images
CREATE POLICY "Anyone can view product images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'products');

-- Allow admins to upload product images
CREATE POLICY "Admins can upload product images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'products' 
  AND public.has_role(auth.uid(), 'admin')
);

-- Allow admins to update product images
CREATE POLICY "Admins can update product images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'products' 
  AND public.has_role(auth.uid(), 'admin')
);

-- Allow admins to delete product images
CREATE POLICY "Admins can delete product images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'products' 
  AND public.has_role(auth.uid(), 'admin')
);