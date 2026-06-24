
ALTER TABLE course_categories ADD COLUMN IF NOT EXISTS sort_order int DEFAULT 0;

INSERT INTO course_categories (name) VALUES
  ('Business Administration'),
  ('Geography and History'),
  ('Public Administration'),
  ('Security Studies and Criminology'),
  ('Semester 1'),
  ('Semester 2'),
  ('Semester 3'),
  ('Sharia and Law')
ON CONFLICT DO NOTHING;
