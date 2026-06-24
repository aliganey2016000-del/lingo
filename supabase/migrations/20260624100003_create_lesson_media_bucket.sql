
-- Create lesson-media storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'lesson-media',
  'lesson-media',
  true,
  536870912,
  ARRAY['image/jpeg','image/png','image/gif','image/webp','video/mp4','video/webm','application/pdf','application/zip','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload
CREATE POLICY "lesson_media_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'lesson-media');

-- Allow public read
CREATE POLICY "lesson_media_select" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'lesson-media');

-- Allow authenticated users to delete their own uploads
CREATE POLICY "lesson_media_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'lesson-media');
