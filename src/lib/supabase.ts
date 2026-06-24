import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = 'student' | 'teacher' | 'admin';

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
}

export interface Level {
  id: string;
  key: string;
  label: string;
  description: string;
  color: string;
  icon: string;
  sort_order: number;
}

export interface Lesson {
  id: string;
  level_id: string;
  teacher_id: string | null;
  title: string;
  description: string | null;
  content: Record<string, unknown> | null;
  duration_minutes: number;
  sort_order: number;
  is_published: boolean;
  created_at: string;
}

export interface Enrollment {
  id: string;
  student_id: string;
  level_id: string;
  enrolled_at: string;
}

export interface LessonProgress {
  id: string;
  student_id: string;
  lesson_id: string;
  score: number;
  completed: boolean;
  completed_at: string | null;
  updated_at: string;
}
