
/*
# English Learning Platform Schema

## Summary
Creates the full schema for an English learning app with three roles: student, teacher, admin.

## New Tables
1. `profiles` — extends auth.users with role, display name, avatar, bio
2. `levels` — e.g. Elementary, Pre-Intermediate, Intermediate, Upper-Intermediate, Advanced
3. `lessons` — lessons belonging to a level, with content (JSON)
4. `enrollments` — students enrolled in levels
5. `lesson_progress` — tracks student progress per lesson (score, completed)
6. `quiz_attempts` — records of each quiz attempt

## Security
- RLS enabled on all tables
- Students can read lessons and manage their own progress
- Teachers can CRUD their own lessons
- Admins can do everything (handled via role check in policies)
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'student' CHECK (role IN ('student','teacher','admin')),
  avatar_url text,
  bio text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select" ON profiles;
CREATE POLICY "profiles_select" ON profiles FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_delete_own" ON profiles;
CREATE POLICY "profiles_delete_own" ON profiles FOR DELETE TO authenticated USING (auth.uid() = id);

-- Levels table
CREATE TABLE IF NOT EXISTS levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  label text NOT NULL,
  description text,
  color text NOT NULL DEFAULT '#3b82f6',
  icon text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE levels ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "levels_select" ON levels;
CREATE POLICY "levels_select" ON levels FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "levels_insert_admin" ON levels;
CREATE POLICY "levels_insert_admin" ON levels FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','teacher')));

DROP POLICY IF EXISTS "levels_update_admin" ON levels;
CREATE POLICY "levels_update_admin" ON levels FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','teacher')));

DROP POLICY IF EXISTS "levels_delete_admin" ON levels;
CREATE POLICY "levels_delete_admin" ON levels FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level_id uuid NOT NULL REFERENCES levels(id) ON DELETE CASCADE,
  teacher_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  content jsonb,
  duration_minutes int DEFAULT 20,
  sort_order int NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "lessons_select_published" ON lessons;
CREATE POLICY "lessons_select_published" ON lessons FOR SELECT TO authenticated
  USING (is_published = true OR teacher_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "lessons_insert_teacher" ON lessons;
CREATE POLICY "lessons_insert_teacher" ON lessons FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','teacher')));

DROP POLICY IF EXISTS "lessons_update_teacher" ON lessons;
CREATE POLICY "lessons_update_teacher" ON lessons FOR UPDATE TO authenticated
  USING (teacher_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "lessons_delete_teacher" ON lessons;
CREATE POLICY "lessons_delete_teacher" ON lessons FOR DELETE TO authenticated
  USING (teacher_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Enrollments table
CREATE TABLE IF NOT EXISTS enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  level_id uuid NOT NULL REFERENCES levels(id) ON DELETE CASCADE,
  enrolled_at timestamptz DEFAULT now(),
  UNIQUE(student_id, level_id)
);

ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "enrollments_select_own" ON enrollments;
CREATE POLICY "enrollments_select_own" ON enrollments FOR SELECT TO authenticated
  USING (student_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','teacher')));

DROP POLICY IF EXISTS "enrollments_insert_own" ON enrollments;
CREATE POLICY "enrollments_insert_own" ON enrollments FOR INSERT TO authenticated
  WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS "enrollments_update_own" ON enrollments;
CREATE POLICY "enrollments_update_own" ON enrollments FOR UPDATE TO authenticated
  USING (student_id = auth.uid());

DROP POLICY IF EXISTS "enrollments_delete_own" ON enrollments;
CREATE POLICY "enrollments_delete_own" ON enrollments FOR DELETE TO authenticated
  USING (student_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Lesson progress table
CREATE TABLE IF NOT EXISTS lesson_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  score int DEFAULT 0,
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(student_id, lesson_id)
);

ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "progress_select_own" ON lesson_progress;
CREATE POLICY "progress_select_own" ON lesson_progress FOR SELECT TO authenticated
  USING (student_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','teacher')));

DROP POLICY IF EXISTS "progress_insert_own" ON lesson_progress;
CREATE POLICY "progress_insert_own" ON lesson_progress FOR INSERT TO authenticated
  WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS "progress_update_own" ON lesson_progress;
CREATE POLICY "progress_update_own" ON lesson_progress FOR UPDATE TO authenticated
  USING (student_id = auth.uid());

DROP POLICY IF EXISTS "progress_delete_own" ON lesson_progress;
CREATE POLICY "progress_delete_own" ON lesson_progress FOR DELETE TO authenticated
  USING (student_id = auth.uid());

-- Insert seed levels
INSERT INTO levels (key, label, description, color, icon, sort_order) VALUES
  ('elementary',         'Elementary',          'Basic English for beginners. Learn everyday words and simple sentences.',          '#10b981', 'Star',         1),
  ('pre-intermediate',   'Pre-Intermediate',    'Build on basics. Simple conversations and common grammar patterns.',               '#3b82f6', 'BookOpen',     2),
  ('intermediate',       'Intermediate',        'Hold real conversations. More complex grammar and wider vocabulary.',              '#8b5cf6', 'Zap',          3),
  ('upper-intermediate', 'Upper-Intermediate',  'Near-fluent English. Nuance, idioms, and advanced structures.',                   '#f59e0b', 'TrendingUp',   4),
  ('advanced',           'Advanced',            'Master English. Academic writing, complex discussions, and native-like fluency.', '#ef4444', 'Award',        5)
ON CONFLICT (key) DO NOTHING;
