ALTER TABLE course_topic_items
  ADD COLUMN IF NOT EXISTS content text DEFAULT '',
  ADD COLUMN IF NOT EXISTS featured_image_url text DEFAULT '',
  ADD COLUMN IF NOT EXISTS video_url text DEFAULT '',
  ADD COLUMN IF NOT EXISTS video_hours int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS video_minutes int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS video_seconds int DEFAULT 0;
