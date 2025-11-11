-- Create storage bucket for game images
INSERT INTO storage.buckets (id, name, public)
VALUES ('game-images', 'game-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for game images
CREATE POLICY "Users can upload their own game images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'game-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own game images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'game-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own game images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'game-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Game images are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'game-images');
