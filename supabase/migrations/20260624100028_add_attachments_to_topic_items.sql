ALTER TABLE course_topic_items
  ADD COLUMN IF NOT EXISTS attachments text[] DEFAULT '{}';
