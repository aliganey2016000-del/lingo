
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT 'New Course',
  slug text UNIQUE,
  description text DEFAULT '',
  thumbnail_url text,
  intro_video_url text,
  pricing_model text DEFAULT 'free',
  visibility text DEFAULT 'public',
  difficulty_level text DEFAULT 'intermediate',
  is_public boolean DEFAULT false,
  is_published boolean DEFAULT false,
  scheduled_at timestamptz,
  what_will_learn text DEFAULT '',
  target_audience text DEFAULT '',
  duration_hours int DEFAULT 0,
  duration_minutes int DEFAULT 0,
  materials_included text DEFAULT '',
  requirements text DEFAULT '',
  tags text[] DEFAULT '{}',
  author_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_courses_authenticated" ON courses FOR SELECT
  TO authenticated USING (true);
CREATE POLICY "insert_courses_admin" ON courses FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "update_courses_admin" ON courses FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "delete_courses_admin" ON courses FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE TABLE IF NOT EXISTS course_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  summary text DEFAULT '',
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE course_topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_course_topics_authenticated" ON course_topics FOR SELECT
  TO authenticated USING (true);
CREATE POLICY "insert_course_topics_admin" ON course_topics FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "update_course_topics_admin" ON course_topics FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "delete_course_topics_admin" ON course_topics FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE TABLE IF NOT EXISTS course_topic_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id uuid REFERENCES course_topics(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'lesson',
  title text NOT NULL DEFAULT '',
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE course_topic_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_course_topic_items_authenticated" ON course_topic_items FOR SELECT
  TO authenticated USING (true);
CREATE POLICY "insert_course_topic_items_admin" ON course_topic_items FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "update_course_topic_items_admin" ON course_topic_items FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "delete_course_topic_items_admin" ON course_topic_items FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
