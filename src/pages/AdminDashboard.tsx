import { useEffect, useState, useRef } from 'react';
import {
  LayoutDashboard, Users, BookOpen, Shield, TrendingUp, Activity,
  CheckCircle, Search, UserX, BarChart2, Layers, Settings,
  GraduationCap, ChevronRight, Eye, EyeOff, Trash2,
  MoreVertical, Clock, FileText, AlertTriangle, X, Save,
  Crown, GraduationCap as StudentIcon,
  RefreshCw, Edit3, Plus, GripVertical, ChevronLeft,
  Upload, Globe, Lock, BookMarked, Video, Paperclip, Image,
  Bold, Italic, Underline, List, AlignLeft, AlignCenter, AlignRight, Link,
} from 'lucide-react';
import SidebarLayout, { NavItem } from '../components/SidebarLayout';
import { useAuth } from '../lib/AuthContext';
import { supabase, Profile } from '../lib/supabase';

type AdminPage = 'overview' | 'users' | 'content' | 'courses' | 'settings';
type CourseBuilderStep = 1 | 2 | 3;

const LEVEL_META: Record<string, {
  gradient: string; lightBg: string; textColor: string;
  badgeClass: string; border: string; cover: string; emoji: string;
}> = {
  elementary:           { gradient: 'from-emerald-500 to-teal-600',  lightBg: 'bg-emerald-50', textColor: 'text-emerald-700', badgeClass: 'bg-emerald-100 text-emerald-700', border: 'border-emerald-200', cover: 'https://images.pexels.com/photos/256395/pexels-photo-256395.jpeg?auto=compress&cs=tinysrgb&w=600&h=300&fit=crop',    emoji: '🌱' },
  'pre-intermediate':   { gradient: 'from-sky-500 to-blue-600',      lightBg: 'bg-blue-50',    textColor: 'text-blue-700',    badgeClass: 'bg-blue-100 text-blue-700',    border: 'border-blue-200',    cover: 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=600&h=300&fit=crop', emoji: '📖' },
  intermediate:         { gradient: 'from-violet-500 to-purple-700', lightBg: 'bg-violet-50',  textColor: 'text-violet-700',  badgeClass: 'bg-violet-100 text-violet-700', border: 'border-violet-200',  cover: 'https://images.pexels.com/photos/301926/pexels-photo-301926.jpeg?auto=compress&cs=tinysrgb&w=600&h=300&fit=crop',              emoji: '⚡' },
  'upper-intermediate': { gradient: 'from-amber-500 to-orange-600',  lightBg: 'bg-amber-50',   textColor: 'text-amber-700',   badgeClass: 'bg-amber-100 text-amber-700',   border: 'border-amber-200',   cover: 'https://images.pexels.com/photos/267669/pexels-photo-267669.jpeg?auto=compress&cs=tinysrgb&w=600&h=300&fit=crop',              emoji: '🚀' },
  advanced:             { gradient: 'from-rose-500 to-red-700',      lightBg: 'bg-rose-50',    textColor: 'text-rose-700',    badgeClass: 'bg-rose-100 text-rose-700',     border: 'border-rose-200',    cover: 'https://images.pexels.com/photos/1438072/pexels-photo-1438072.jpeg?auto=compress&cs=tinysrgb&w=600&h=300&fit=crop',            emoji: '🏆' },
};

const navItems: NavItem[] = [
  { key: 'overview', label: 'Overview',       icon: LayoutDashboard },
  { key: 'users',    label: 'Users',           icon: Users },
  { key: 'content',  label: 'Content',         icon: BookOpen },
  { key: 'courses',  label: 'Course Builder',  icon: Layers },
  { key: 'settings', label: 'Settings',        icon: Settings },
];

interface LessonRow {
  id: string; title: string; is_published: boolean;
  level_key: string; level_label: string; level_id: string;
  teacher_name: string; duration_minutes: number; created_at: string;
  description: string;
}
interface LevelRow {
  id: string; key: string; label: string; description: string;
  sort_order: number; lesson_count: number; published_count: number;
}
interface CourseRow {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string | null;
  pricing_model: string;
  visibility: string;
  difficulty_level: string;
  is_published: boolean;
  created_at: string;
  topic_count: number;
}

interface CourseFormData {
  title: string;
  description: string;
  thumbnail_url: string;
  intro_video_url: string;
  pricing_model: 'free' | 'paid';
  visibility: 'public' | 'private';
  difficulty_level: string;
  is_public: boolean;
  tags: string;
  what_will_learn: string;
  target_audience: string;
  duration_hours: number;
  duration_minutes_extra: number;
  materials_included: string;
  requirements: string;
}

interface TopicItem {
  tempId: string;
  type: 'lesson' | 'quiz' | 'assignment';
  title: string;
  editing: boolean;
  content: string;
  featured_image_url: string;
  video_url: string;
  video_hours: number;
  video_minutes: number;
  video_seconds: number;
}

interface CurriculumTopic {
  tempId: string;
  title: string;
  summary: string;
  editing: boolean;
  items: TopicItem[];
}

// ── Shared ActionMenu ────────────────────────────────────────────────────────
interface ActionItem {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  danger?: boolean;
  divider?: boolean;
  disabled?: boolean;
}
function ActionMenu({ items, align = 'right' }: { items: ActionItem[]; align?: 'right' | 'left' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  return (
    <div ref={ref} className="relative" onClick={e => e.stopPropagation()}>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/90 backdrop-blur-sm border border-slate-200 shadow-sm hover:bg-white hover:shadow-md transition-all text-slate-600"
      >
        <MoreVertical size={15} />
      </button>
      {open && (
        <div
          className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} top-10 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50`}
          style={{ animation: 'fadeInUp 0.12s ease' }}
        >
          {items.map((item, i) => (
            <div key={i}>
              {item.divider && i > 0 && <div className="h-px bg-slate-100 mx-3 my-0.5" />}
              <button
                onClick={() => { if (!item.disabled) { item.onClick(); setOpen(false); } }}
                disabled={item.disabled}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors text-left ${
                  item.disabled
                    ? 'text-slate-300 cursor-not-allowed'
                    : item.danger
                      ? 'text-red-600 hover:bg-red-50'
                      : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <item.icon size={15} className={item.disabled ? 'text-slate-300' : item.danger ? 'text-red-500' : 'text-slate-400'} />
                {item.label}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Delete confirm modal ─────────────────────────────────────────────────────
function DeleteModal({ title, body, onConfirm, onCancel }: { title: string; body: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6 text-center">
        <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={26} className="text-red-500" />
        </div>
        <h2 className="font-bold text-slate-900 text-lg mb-1">{title}</h2>
        <p className="text-slate-500 text-sm mb-6">{body}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 text-sm transition-colors">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-sm transition-colors">Delete</button>
        </div>
      </div>
    </div>
  );
}

// ── Edit Lesson Modal ────────────────────────────────────────────────────────
function EditLessonModal({ lesson, levels, onSave, onClose }: {
  lesson: LessonRow;
  levels: LevelRow[];
  onSave: (id: string, data: { title: string; description: string; duration_minutes: number; level_id: string; is_published: boolean }) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    title: lesson.title,
    description: lesson.description,
    duration_minutes: lesson.duration_minutes,
    level_id: lesson.level_id,
    is_published: lesson.is_published,
  });
  const [saving, setSaving] = useState(false);
  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    await onSave(lesson.id, { ...form, title: form.title.trim() });
    setSaving(false);
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <h2 className="font-bold text-slate-900 text-lg">Edit Lesson</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><X size={18} className="text-slate-500" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-1.5">Title</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition" />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-1.5">Level</label>
            <select value={form.level_id} onChange={e => setForm(f => ({ ...f, level_id: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition bg-white">
              {levels.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">Duration (min)</label>
              <input type="number" min={5} max={120} value={form.duration_minutes}
                onChange={e => setForm(f => ({ ...f, duration_minutes: +e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 transition" />
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <div
                  onClick={() => setForm(f => ({ ...f, is_published: !f.is_published }))}
                  className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${form.is_published ? 'bg-emerald-500' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${form.is_published ? 'left-4' : 'left-0.5'}`} />
                </div>
                <span className="text-sm font-medium text-slate-700">Published</span>
              </label>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors">
            <Save size={14} />{saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Lesson Card ──────────────────────────────────────────────────────────────
function AdminLessonCard({ lesson, onToggle, onEdit, onDelete }: {
  lesson: LessonRow;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const m = LEVEL_META[lesson.level_key] ?? LEVEL_META['elementary'];
  const menuItems: ActionItem[] = [
    { icon: Edit3,                                    label: 'Edit Lesson',                  onClick: onEdit },
    { icon: lesson.is_published ? EyeOff : Eye,       label: lesson.is_published ? 'Move to Draft' : 'Publish', onClick: onToggle, divider: true },
    { icon: Trash2,                                   label: 'Delete Lesson',                onClick: onDelete, danger: true, divider: true },
  ];
  return (
    <div className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300">
      <div className="relative h-36 overflow-hidden">
        <img src={m.cover} alt={lesson.level_label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
        <div className={`absolute inset-0 bg-gradient-to-br ${m.gradient} opacity-20`} />
        <div className="absolute top-3 left-3">
          {lesson.is_published ? (
            <span className="flex items-center gap-1 text-xs font-bold text-white bg-emerald-500 px-2.5 py-1 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Live
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs font-bold text-white bg-amber-500 px-2.5 py-1 rounded-full">
              <FileText size={10} /> Draft
            </span>
          )}
        </div>
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity lg:block">
          <ActionMenu items={menuItems} />
        </div>
        <div className="lg:hidden absolute top-3 right-3">
          <ActionMenu items={menuItems} />
        </div>
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-2.5 flex items-center gap-1.5">
          <span className="text-base">{m.emoji}</span>
          <span className="text-white/60 text-xs">{lesson.level_label}</span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-slate-900 text-sm leading-snug mb-1 line-clamp-2">{lesson.title}</h3>
        <p className="text-xs text-slate-400 mb-3 line-clamp-1">By {lesson.teacher_name}</p>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="flex items-center gap-1"><Clock size={11} /> {lesson.duration_minutes}m</span>
          <span className={`px-2 py-0.5 rounded-full font-medium ${m.badgeClass}`}>{lesson.level_label}</span>
        </div>
      </div>
    </div>
  );
}

// ── User Action Menu ─────────────────────────────────────────────────────────
function UserActionMenu({ user, onChangeRole, onDelete }: {
  user: Profile;
  onChangeRole: (role: string) => void;
  onDelete: () => void;
}) {
  const items: ActionItem[] = [
    { icon: StudentIcon, label: 'Set as Student', onClick: () => onChangeRole('student') },
    { icon: BookOpen,    label: 'Set as Teacher', onClick: () => onChangeRole('teacher') },
    { icon: Crown,       label: 'Set as Admin',   onClick: () => onChangeRole('admin'), divider: true },
    { icon: Trash2,      label: 'Delete User',    onClick: onDelete, danger: true, divider: true },
  ].filter(item => {
    if (item.label === 'Set as Student' && user.role === 'student') return false;
    if (item.label === 'Set as Teacher' && user.role === 'teacher') return false;
    if (item.label === 'Set as Admin'   && user.role === 'admin')   return false;
    return true;
  });
  return <ActionMenu items={items} />;
}

// ── Course Card ──────────────────────────────────────────────────────────────
function CourseCard({ course, onEdit, onDelete, onTogglePublish }: {
  course: CourseRow;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePublish: () => void;
}) {
  const cover = course.thumbnail_url || 'https://images.pexels.com/photos/301926/pexels-photo-301926.jpeg?auto=compress&cs=tinysrgb&w=600&h=300&fit=crop';
  const menuItems: ActionItem[] = [
    { icon: Edit3,                                              label: 'Edit Course',                        onClick: onEdit },
    { icon: course.is_published ? EyeOff : Eye,                label: course.is_published ? 'Unpublish' : 'Publish', onClick: onTogglePublish, divider: true },
    { icon: Trash2,                                             label: 'Delete Course',                      onClick: onDelete, danger: true, divider: true },
  ];
  return (
    <div className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300">
      <div className="relative h-40 overflow-hidden">
        <img src={cover} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
        <div className="absolute top-3 left-3">
          {course.is_published ? (
            <span className="flex items-center gap-1 text-xs font-bold text-white bg-emerald-500 px-2.5 py-1 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Published
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs font-bold text-white bg-amber-500 px-2.5 py-1 rounded-full">
              <FileText size={10} /> Draft
            </span>
          )}
        </div>
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity lg:block">
          <ActionMenu items={menuItems} />
        </div>
        <div className="lg:hidden absolute top-3 right-3">
          <ActionMenu items={menuItems} />
        </div>
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-3">
          <h3 className="font-black text-white text-base leading-tight line-clamp-2">{course.title}</h3>
        </div>
      </div>
      <div className="p-4">
        {course.description && (
          <p className="text-xs text-slate-500 line-clamp-2 mb-3">{course.description}</p>
        )}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <Layers size={11} /> {course.topic_count} {course.topic_count === 1 ? 'topic' : 'topics'}
          </span>
          {course.pricing_model === 'free' ? (
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">Free</span>
          ) : (
            <span className="text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">Paid</span>
          )}
          {course.visibility === 'public' ? (
            <span className="flex items-center gap-0.5 text-xs text-slate-400"><Globe size={10} /> Public</span>
          ) : (
            <span className="flex items-center gap-0.5 text-xs text-slate-400"><Lock size={10} /> Private</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Lesson Content Modal ─────────────────────────────────────────────────────
function LessonContentModal({ item, topicTitle, onSave, onClose }: {
  item: TopicItem;
  topicTitle: string;
  onSave: (patch: Partial<TopicItem>) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    title: item.title,
    content: item.content,
    featured_image_url: item.featured_image_url,
    video_url: item.video_url,
    video_hours: item.video_hours,
    video_minutes: item.video_minutes,
    video_seconds: item.video_seconds,
  });
  const hasChanges =
    form.title !== item.title ||
    form.content !== item.content ||
    form.featured_image_url !== item.featured_image_url ||
    form.video_url !== item.video_url ||
    form.video_hours !== item.video_hours ||
    form.video_minutes !== item.video_minutes ||
    form.video_seconds !== item.video_seconds;

  const handleSave = () => {
    onSave({ ...form, editing: false });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-white animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200 bg-white shadow-sm flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          {hasChanges && (
            <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded-lg text-xs font-semibold flex-shrink-0">
              <AlertTriangle size={12} /> Unsaved Changes
            </div>
          )}
          <span className="text-sm text-slate-400 truncate">Topic: <span className="font-semibold text-slate-700">{topicTitle}</span></span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
          <button
            onClick={handleSave}
            disabled={!form.title.trim()}
            className="flex items-center gap-1.5 px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition-colors shadow"
          >
            <Save size={14} /> Save
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto bg-slate-50">
        <div className="max-w-6xl mx-auto p-6 flex flex-col lg:flex-row gap-6">
          {/* Left — main content */}
          <div className="flex-1 space-y-5">
            {/* Name */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Name</label>
              <input
                autoFocus
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Enter lesson title…"
                className="w-full text-base font-semibold text-slate-900 bg-transparent border-b border-slate-200 pb-2 focus:outline-none focus:border-rose-400 transition"
              />
            </div>

            {/* Content editor */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Content</label>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-rose-600 font-semibold bg-rose-50 border border-rose-100 px-2 py-0.5 rounded">Visual</span>
                  <span className="text-xs text-slate-400 font-medium px-2 py-0.5 rounded cursor-pointer hover:bg-slate-100">Code</span>
                </div>
              </div>
              {/* Toolbar */}
              <div className="flex items-center flex-wrap gap-0.5 px-3 py-2 border-b border-slate-100 bg-slate-50">
                {[
                  { icon: Bold,        title: 'Bold' },
                  { icon: Italic,      title: 'Italic' },
                  { icon: Underline,   title: 'Underline' },
                  { icon: List,        title: 'List' },
                  { icon: AlignLeft,   title: 'Align Left' },
                  { icon: AlignCenter, title: 'Align Center' },
                  { icon: AlignRight,  title: 'Align Right' },
                  { icon: Link,        title: 'Link' },
                ].map(btn => (
                  <button
                    key={btn.title}
                    title={btn.title}
                    type="button"
                    className="p-1.5 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    <btn.icon size={14} />
                  </button>
                ))}
              </div>
              <textarea
                value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                placeholder="Write the lesson content here…"
                rows={12}
                className="w-full px-5 py-4 text-sm text-slate-700 bg-white focus:outline-none resize-none placeholder-slate-300"
              />
            </div>
          </div>

          {/* Right sidebar */}
          <div className="w-full lg:w-72 space-y-4 flex-shrink-0">
            {/* Featured Image */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Featured Image</label>
              {form.featured_image_url ? (
                <div className="relative group mb-2">
                  <img src={form.featured_image_url} alt="preview" className="w-full h-36 object-cover rounded-xl" />
                  <button
                    onClick={() => setForm(f => ({ ...f, featured_image_url: '' }))}
                    className="absolute top-2 right-2 p-1 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} className="text-white" />
                  </button>
                </div>
              ) : (
                <div className="w-full h-36 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300 mb-3">
                  <Image size={24} />
                  <span className="text-xs mt-1">No image</span>
                </div>
              )}
              <input
                value={form.featured_image_url}
                onChange={e => setForm(f => ({ ...f, featured_image_url: e.target.value }))}
                placeholder="Paste image URL…"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-400 transition"
              />
              <p className="text-xs text-slate-400 mt-1">JPEG, PNG, GIF, and WebP formats</p>
            </div>

            {/* Video */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Video</label>
              <div className="w-full h-28 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300 mb-3">
                <Video size={22} />
                <span className="text-xs mt-1">No video</span>
              </div>
              <input
                value={form.video_url}
                onChange={e => setForm(f => ({ ...f, video_url: e.target.value }))}
                placeholder="Add from URL…"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-400 transition"
              />
              <p className="text-xs text-slate-400 mt-1">MP4, and WebM formats</p>
            </div>

            {/* Video Playback Time */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Video Playback Time</label>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 flex-1">
                  <input
                    type="number" min={0} value={form.video_hours}
                    onChange={e => setForm(f => ({ ...f, video_hours: Math.max(0, +e.target.value) }))}
                    className="w-full px-2 py-2 rounded-lg border border-slate-200 text-sm text-center focus:outline-none focus:ring-2 focus:ring-rose-400 transition"
                  />
                  <span className="text-xs text-slate-500 flex-shrink-0">hour</span>
                </div>
                <div className="flex items-center gap-1.5 flex-1">
                  <input
                    type="number" min={0} max={59} value={form.video_minutes}
                    onChange={e => setForm(f => ({ ...f, video_minutes: Math.max(0, Math.min(59, +e.target.value)) }))}
                    className="w-full px-2 py-2 rounded-lg border border-slate-200 text-sm text-center focus:outline-none focus:ring-2 focus:ring-rose-400 transition"
                  />
                  <span className="text-xs text-slate-500 flex-shrink-0">min</span>
                </div>
                <div className="flex items-center gap-1.5 flex-1">
                  <input
                    type="number" min={0} max={59} value={form.video_seconds}
                    onChange={e => setForm(f => ({ ...f, video_seconds: Math.max(0, Math.min(59, +e.target.value)) }))}
                    className="w-full px-2 py-2 rounded-lg border border-slate-200 text-sm text-center focus:outline-none focus:ring-2 focus:ring-rose-400 transition"
                  />
                  <span className="text-xs text-slate-500 flex-shrink-0">sec</span>
                </div>
              </div>
            </div>

            {/* Exercise Files */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Exercise Files</label>
              <button
                type="button"
                className="w-full flex items-center justify-center gap-2 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-50 hover:border-slate-300 transition-colors"
              >
                <Paperclip size={14} /> Upload Attachment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Course Builder Modal (multi-stage) ───────────────────────────────────────
const defaultCourseForm: CourseFormData = {
  title: '',
  description: '',
  thumbnail_url: '',
  intro_video_url: '',
  pricing_model: 'free',
  visibility: 'public',
  difficulty_level: 'intermediate',
  is_public: false,
  tags: '',
  what_will_learn: '',
  target_audience: '',
  duration_hours: 0,
  duration_minutes_extra: 0,
  materials_included: '',
  requirements: '',
};

function CourseBuilderModal({ onClose, onSaved, authorId }: {
  onClose: () => void;
  onSaved: (course: CourseRow) => void;
  authorId: string;
}) {
  const [step, setStep] = useState<CourseBuilderStep>(1);
  const [form, setForm] = useState<CourseFormData>(defaultCourseForm);
  const [activeOptionsTab, setActiveOptionsTab] = useState<'general' | 'drip' | 'enrollment'>('general');
  const [topics, setTopics] = useState<CurriculumTopic[]>([]);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [lessonContentEdit, setLessonContentEdit] = useState<{ topicTempId: string; item: TopicItem } | null>(null);

  const slugify = (t: string) =>
    t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  const addTopic = () => {
    const t: CurriculumTopic = {
      tempId: crypto.randomUUID(),
      title: '',
      summary: '',
      editing: true,
      items: [],
    };
    setTopics(prev => [...prev, t]);
  };

  const updateTopic = (tempId: string, patch: Partial<CurriculumTopic>) =>
    setTopics(prev => prev.map(t => t.tempId === tempId ? { ...t, ...patch } : t));

  const removeTopic = (tempId: string) =>
    setTopics(prev => prev.filter(t => t.tempId !== tempId));

  const addItem = (topicTempId: string, type: 'lesson' | 'quiz' | 'assignment') => {
    const item: TopicItem = {
      tempId: crypto.randomUUID(), type, title: '', editing: true,
      content: '', featured_image_url: '', video_url: '',
      video_hours: 0, video_minutes: 0, video_seconds: 0,
    };
    setTopics(prev => prev.map(t =>
      t.tempId === topicTempId ? { ...t, items: [...t.items, item] } : t
    ));
  };

  const updateItem = (topicTempId: string, itemTempId: string, patch: Partial<TopicItem>) =>
    setTopics(prev => prev.map(t =>
      t.tempId === topicTempId
        ? { ...t, items: t.items.map(i => i.tempId === itemTempId ? { ...i, ...patch } : i) }
        : t
    ));

  const removeItem = (topicTempId: string, itemTempId: string) =>
    setTopics(prev => prev.map(t =>
      t.tempId === topicTempId ? { ...t, items: t.items.filter(i => i.tempId !== itemTempId) } : t
    ));

  const handleSave = async (publish: boolean) => {
    if (!form.title.trim()) return;
    publish ? setPublishing(true) : setSaving(true);

    const slug = slugify(form.title) + '-' + Date.now();
    const { data: courseData, error } = await supabase
      .from('courses')
      .insert({
        title: form.title.trim(),
        slug,
        description: form.description,
        thumbnail_url: form.thumbnail_url || null,
        intro_video_url: form.intro_video_url || null,
        pricing_model: form.pricing_model,
        visibility: form.visibility,
        difficulty_level: form.difficulty_level,
        is_public: form.is_public,
        is_published: publish,
        what_will_learn: form.what_will_learn,
        target_audience: form.target_audience,
        duration_hours: form.duration_hours,
        duration_minutes: form.duration_minutes_extra,
        materials_included: form.materials_included,
        requirements: form.requirements,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        author_id: authorId,
      })
      .select()
      .single();

    if (error || !courseData) { setSaving(false); setPublishing(false); return; }

    const savedTopics = topics.filter(t => t.title.trim());
    for (let i = 0; i < savedTopics.length; i++) {
      const tp = savedTopics[i];
      const { data: topicData } = await supabase
        .from('course_topics')
        .insert({ course_id: courseData.id, title: tp.title.trim(), summary: tp.summary, sort_order: i })
        .select()
        .single();
      if (topicData) {
        const validItems = tp.items.filter(it => it.title.trim());
        for (let j = 0; j < validItems.length; j++) {
          const it = validItems[j];
          await supabase
            .from('course_topic_items')
            .insert({
              topic_id: topicData.id, type: it.type, title: it.title.trim(), sort_order: j,
              content: it.content, featured_image_url: it.featured_image_url,
              video_url: it.video_url, video_hours: it.video_hours,
              video_minutes: it.video_minutes, video_seconds: it.video_seconds,
            });
        }
      }
    }

    onSaved({
      id: courseData.id,
      title: courseData.title,
      description: courseData.description ?? '',
      thumbnail_url: courseData.thumbnail_url,
      pricing_model: courseData.pricing_model,
      visibility: courseData.visibility,
      difficulty_level: courseData.difficulty_level,
      is_published: courseData.is_published,
      created_at: courseData.created_at,
      topic_count: savedTopics.length,
    });
    setSaving(false);
    setPublishing(false);
    onClose();
  };

  const stepLabels: { num: CourseBuilderStep; label: string }[] = [
    { num: 1, label: 'Basics' },
    { num: 2, label: 'Curriculum' },
    { num: 3, label: 'Additional' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200 bg-white shadow-sm flex-shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center">
              <BookMarked size={14} className="text-white" />
            </div>
            <span className="font-bold text-slate-800 text-sm">Course Builder</span>
          </div>
          {/* Step indicators */}
          <div className="hidden sm:flex items-center gap-1">
            {stepLabels.map((s, idx) => (
              <div key={s.num} className="flex items-center gap-1">
                {idx > 0 && <div className="w-8 h-px bg-slate-200" />}
                <button
                  onClick={() => setStep(s.num)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    step === s.num
                      ? 'bg-rose-600 text-white shadow'
                      : step > s.num
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black ${
                    step === s.num ? 'bg-white/20 text-white' : step > s.num ? 'bg-emerald-200 text-emerald-700' : 'bg-slate-200 text-slate-500'
                  }`}>{s.num}</span>
                  {s.label}
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSave(false)}
            disabled={saving || publishing || !form.title.trim()}
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-600 text-xs font-semibold rounded-xl hover:bg-slate-50 disabled:opacity-40 transition-colors"
          >
            <Save size={13} /> {saving ? 'Saving…' : 'Save as Draft'}
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={saving || publishing || !form.title.trim()}
            className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl disabled:opacity-40 transition-colors shadow"
          >
            {publishing ? 'Publishing…' : 'Publish'}
          </button>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors ml-1">
            <X size={18} className="text-slate-500" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-slate-50">
        {/* ── Step 1: Basics ── */}
        {step === 1 && (
          <div className="max-w-6xl mx-auto p-6 flex flex-col lg:flex-row gap-6">
            {/* Left / Main */}
            <div className="flex-1 space-y-5">
              {/* Title */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Title</label>
                <input
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="New Course"
                  className="w-full text-lg font-semibold text-slate-900 bg-transparent border-b border-slate-200 pb-2 focus:outline-none focus:border-rose-400 transition"
                />
                {form.title && (
                  <p className="text-xs text-slate-400 mt-2">
                    Course URL: <span className="text-slate-600">…/courses/{slugify(form.title) || 'new-course'}</span>
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={6}
                  placeholder="Describe what this course is about…"
                  className="w-full text-sm text-slate-700 bg-transparent focus:outline-none resize-none placeholder-slate-300"
                />
              </div>

              {/* Options */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="flex border-b border-slate-100">
                  {(['general', 'drip', 'enrollment'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveOptionsTab(tab)}
                      className={`flex-1 py-3 text-xs font-semibold capitalize transition-colors ${
                        activeOptionsTab === tab
                          ? 'text-rose-600 border-b-2 border-rose-500 bg-rose-50/50'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {tab === 'drip' ? 'Content Drip' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>
                <div className="p-5">
                  {activeOptionsTab === 'general' && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-semibold text-slate-700 block mb-1.5">Difficulty Level</label>
                        <select
                          value={form.difficulty_level}
                          onChange={e => setForm(f => ({ ...f, difficulty_level: e.target.value }))}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose-400 transition"
                        >
                          {['Beginner', 'Elementary', 'Pre-Intermediate', 'Intermediate', 'Upper-Intermediate', 'Advanced'].map(l => (
                            <option key={l} value={l.toLowerCase()}>{l}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-700">Public Course</p>
                          <p className="text-xs text-slate-400 mt-0.5">Visible to all users without enrollment</p>
                        </div>
                        <div
                          onClick={() => setForm(f => ({ ...f, is_public: !f.is_public }))}
                          className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer flex-shrink-0 ${form.is_public ? 'bg-rose-500' : 'bg-slate-200'}`}
                        >
                          <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${form.is_public ? 'left-5' : 'left-0.5'}`} />
                        </div>
                      </div>
                    </div>
                  )}
                  {activeOptionsTab === 'drip' && (
                    <p className="text-sm text-slate-400 text-center py-4">Content drip settings can be configured after publishing the course.</p>
                  )}
                  {activeOptionsTab === 'enrollment' && (
                    <p className="text-sm text-slate-400 text-center py-4">Enrollment settings can be configured after publishing the course.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right sidebar */}
            <div className="w-full lg:w-72 space-y-4 flex-shrink-0">
              {/* Visibility */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Visibility</label>
                <select
                  value={form.visibility}
                  onChange={e => setForm(f => ({ ...f, visibility: e.target.value as 'public' | 'private' }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose-400 transition"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>

              {/* Featured Image */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Featured Image</label>
                <input
                  value={form.thumbnail_url}
                  onChange={e => setForm(f => ({ ...f, thumbnail_url: e.target.value }))}
                  placeholder="Paste image URL…"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-400 transition"
                />
                {form.thumbnail_url && (
                  <img src={form.thumbnail_url} alt="preview" className="mt-2 w-full h-28 object-cover rounded-xl" />
                )}
                {!form.thumbnail_url && (
                  <div className="mt-2 w-full h-28 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300">
                    <Upload size={20} />
                    <span className="text-xs mt-1">No image</span>
                  </div>
                )}
              </div>

              {/* Intro Video */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Intro Video URL</label>
                <input
                  value={form.intro_video_url}
                  onChange={e => setForm(f => ({ ...f, intro_video_url: e.target.value }))}
                  placeholder="Paste video URL…"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-400 transition"
                />
              </div>

              {/* Pricing */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Pricing Model</label>
                <div className="flex gap-3">
                  {(['free', 'paid'] as const).map(p => (
                    <label key={p} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={form.pricing_model === p}
                        onChange={() => setForm(f => ({ ...f, pricing_model: p }))}
                        className="accent-rose-500"
                      />
                      <span className="text-sm font-medium text-slate-700 capitalize">{p}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Tags</label>
                <input
                  value={form.tags}
                  onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                  placeholder="english, grammar, beginner…"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-400 transition"
                />
                <p className="text-xs text-slate-400 mt-1">Separate with commas</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 2: Curriculum ── */}
        {step === 2 && (
          <div className="max-w-3xl mx-auto p-6">
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => setStep(1)} className="p-2 hover:bg-white rounded-xl transition-colors">
                <ChevronLeft size={18} className="text-slate-500" />
              </button>
              <h2 className="text-xl font-bold text-slate-900">Curriculum</h2>
            </div>

            <div className="space-y-3">
              {topics.map((topic, tIdx) => (
                <div key={topic.tempId} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  {topic.editing ? (
                    <div className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <GripVertical size={16} className="text-slate-300 mt-2.5 flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                          <input
                            autoFocus
                            value={topic.title}
                            onChange={e => updateTopic(topic.tempId, { title: e.target.value })}
                            placeholder="Add a title"
                            className="w-full px-4 py-2.5 rounded-xl border border-rose-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-rose-400 transition"
                          />
                          <textarea
                            value={topic.summary}
                            onChange={e => updateTopic(topic.tempId, { summary: e.target.value })}
                            placeholder="Add a summary"
                            rows={2}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 transition resize-none"
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => removeTopic(topic.tempId)}
                          className="px-4 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                        >Cancel</button>
                        <button
                          onClick={() => { if (topic.title.trim()) updateTopic(topic.tempId, { editing: false }); }}
                          className="px-4 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors"
                        >Ok</button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <GripVertical size={14} className="text-slate-300" />
                          <span className="text-xs font-bold text-slate-400 uppercase">Topic {tIdx + 1}</span>
                          <span className="font-bold text-slate-800 text-sm">{topic.title}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => updateTopic(topic.tempId, { editing: true })}
                            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <Edit3 size={13} className="text-slate-400" />
                          </button>
                          <button
                            onClick={() => removeTopic(topic.tempId)}
                            className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={13} className="text-red-400" />
                          </button>
                        </div>
                      </div>

                      {/* Topic items */}
                      {topic.items.length > 0 && (
                        <div className="px-4 py-2 space-y-1.5 border-b border-slate-100">
                          {topic.items.map(item => (
                            <div key={item.tempId} className="flex items-center gap-2">
                              {item.editing ? (
                                <>
                                  <span className={`text-xs font-bold px-2 py-0.5 rounded-md flex-shrink-0 ${
                                    item.type === 'lesson' ? 'bg-blue-100 text-blue-600' :
                                    item.type === 'quiz'   ? 'bg-amber-100 text-amber-600' :
                                                             'bg-green-100 text-green-600'
                                  }`}>{item.type}</span>
                                  <input
                                    autoFocus
                                    value={item.title}
                                    onChange={e => updateItem(topic.tempId, item.tempId, { title: e.target.value })}
                                    onKeyDown={e => { if (e.key === 'Enter' && item.title.trim()) updateItem(topic.tempId, item.tempId, { editing: false }); }}
                                    placeholder={`${item.type.charAt(0).toUpperCase() + item.type.slice(1)} title…`}
                                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-400 transition"
                                  />
                                  <button onClick={() => { if (item.title.trim()) updateItem(topic.tempId, item.tempId, { editing: false }); }}
                                    className="text-xs font-semibold text-rose-600 px-2 py-1 hover:bg-rose-50 rounded-lg">Ok</button>
                                  <button onClick={() => removeItem(topic.tempId, item.tempId)}
                                    className="p-1 hover:bg-red-50 rounded-lg"><X size={12} className="text-red-400" /></button>
                                </>
                              ) : (
                                <>
                                  <span className={`text-xs font-bold px-2 py-0.5 rounded-md flex-shrink-0 ${
                                    item.type === 'lesson' ? 'bg-blue-100 text-blue-600' :
                                    item.type === 'quiz'   ? 'bg-amber-100 text-amber-600' :
                                                             'bg-green-100 text-green-600'
                                  }`}>{item.type}</span>
                                  <span
                                    className={`flex-1 text-sm text-slate-700 truncate ${item.type === 'lesson' ? 'cursor-pointer hover:text-rose-600' : ''}`}
                                    onClick={() => item.type === 'lesson' && setLessonContentEdit({ topicTempId: topic.tempId, item })}
                                  >{item.title}</span>
                                  <button
                                    onClick={() => item.type === 'lesson'
                                      ? setLessonContentEdit({ topicTempId: topic.tempId, item })
                                      : updateItem(topic.tempId, item.tempId, { editing: true })
                                    }
                                    className="p-1 hover:bg-slate-100 rounded-lg"
                                  ><Edit3 size={12} className="text-slate-400" /></button>
                                  <button onClick={() => removeItem(topic.tempId, item.tempId)}
                                    className="p-1 hover:bg-red-50 rounded-lg"><X size={12} className="text-red-400" /></button>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="px-4 py-3 flex flex-wrap gap-2">
                        {(['lesson', 'quiz', 'assignment'] as const).map(type => (
                          <button
                            key={type}
                            onClick={() => addItem(topic.tempId, type)}
                            className="flex items-center gap-1 text-xs font-semibold text-slate-500 border border-slate-200 hover:border-rose-300 hover:text-rose-600 px-3 py-1.5 rounded-xl transition-colors"
                          >
                            <Plus size={11} /> {type.charAt(0).toUpperCase() + type.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={addTopic}
              className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-xl transition-colors shadow"
            >
              <Plus size={15} /> Add Topic
            </button>
          </div>
        )}

        {/* ── Step 3: Additional ── */}
        {step === 3 && (
          <div className="max-w-3xl mx-auto p-6">
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => setStep(2)} className="p-2 hover:bg-white rounded-xl transition-colors">
                <ChevronLeft size={18} className="text-slate-500" />
              </button>
              <h2 className="text-xl font-bold text-slate-900">Additional</h2>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Overview</p>
                <p className="text-sm text-slate-500">Provide essential course information to attract and inform potential students.</p>
              </div>

              {[
                { key: 'what_will_learn',      label: 'What Will I Learn?',          placeholder: 'Define the key takeaways (one per line)' },
                { key: 'target_audience',      label: 'Target Audience',              placeholder: 'Specify the target audience (one per line)' },
                { key: 'materials_included',   label: 'Materials Included',           placeholder: 'List assets provided to students (one per line)' },
                { key: 'requirements',         label: 'Requirements / Instructions',  placeholder: 'Additional requirements or instructions (one per line)' },
              ].map(field => (
                <div key={field.key}>
                  <label className="text-sm font-semibold text-slate-700 block mb-1.5">{field.label}</label>
                  <textarea
                    value={form[field.key as keyof CourseFormData] as string}
                    onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                    rows={3}
                    placeholder={field.placeholder}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 transition resize-none placeholder-slate-300"
                  />
                </div>
              ))}

              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-1.5">Total Course Duration</label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="number" min={0} value={form.duration_hours}
                      onChange={e => setForm(f => ({ ...f, duration_hours: +e.target.value }))}
                      className="w-24 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 transition"
                    />
                    <span className="text-sm text-slate-500">hour(s)</span>
                  </div>
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="number" min={0} max={59} value={form.duration_minutes_extra}
                      onChange={e => setForm(f => ({ ...f, duration_minutes_extra: +e.target.value }))}
                      className="w-24 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 transition"
                    />
                    <span className="text-sm text-slate-500">min(s)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div className="flex items-center justify-between px-6 py-3 border-t border-slate-200 bg-white flex-shrink-0">
        <button
          onClick={() => setStep(s => Math.max(1, s - 1) as CourseBuilderStep)}
          disabled={step === 1}
          className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50 disabled:opacity-30 transition-colors"
        >
          <ChevronLeft size={15} /> Previous
        </button>
        <div className="flex items-center gap-1">
          {stepLabels.map(s => (
            <div key={s.num} className={`w-2 h-2 rounded-full transition-all ${step === s.num ? 'bg-rose-500 w-5' : step > s.num ? 'bg-emerald-400' : 'bg-slate-200'}`} />
          ))}
        </div>
        {step < 3 ? (
          <button
            onClick={() => setStep(s => Math.min(3, s + 1) as CourseBuilderStep)}
            className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-xl transition-colors shadow"
          >
            Next <ChevronRight size={15} />
          </button>
        ) : (
          <button
            onClick={() => handleSave(false)}
            disabled={saving || !form.title.trim()}
            className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition-colors shadow"
          >
            <Save size={13} /> {saving ? 'Saving…' : 'Save Draft'}
          </button>
        )}
      </div>

      {/* Lesson Content Modal */}
      {lessonContentEdit && (
        <LessonContentModal
          item={lessonContentEdit.item}
          topicTitle={topics.find(t => t.tempId === lessonContentEdit.topicTempId)?.title ?? ''}
          onSave={patch => updateItem(lessonContentEdit.topicTempId, lessonContentEdit.item.tempId, patch)}
          onClose={() => setLessonContentEdit(null)}
        />
      )}
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { profile } = useAuth();
  const [page, setPage]         = useState<AdminPage>('overview');
  const [users, setUsers]       = useState<Profile[]>([]);
  const [lessons, setLessons]   = useState<LessonRow[]>([]);
  const [levelRows, setLevelRows] = useState<LevelRow[]>([]);
  const [courses, setCourses]   = useState<CourseRow[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [contentFilter, setContentFilter] = useState<string>('all');
  const [stats, setStats] = useState({ students: 0, teachers: 0, admins: 0, lessons: 0, published: 0, enrollments: 0, completions: 0 });

  // Modals
  const [deleteLesson, setDeleteLesson]   = useState<LessonRow | null>(null);
  const [deleteUser, setDeleteUser]       = useState<Profile | null>(null);
  const [deleteCourse, setDeleteCourse]   = useState<CourseRow | null>(null);
  const [editLesson, setEditLesson]       = useState<LessonRow | null>(null);
  const [showCourseBuilder, setShowCourseBuilder] = useState(false);

  const loadData = async () => {
    const [usersRes, lessonsRes, levelsRes, enrRes, progRes, profilesRes, coursesRes, topicsRes] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('lessons').select('*').order('created_at', { ascending: false }),
      supabase.from('levels').select('*').order('sort_order'),
      supabase.from('enrollments').select('*', { count: 'exact' }),
      supabase.from('lesson_progress').select('*').eq('completed', true),
      supabase.from('profiles').select('id, full_name, role'),
      supabase.from('courses').select('*').order('created_at', { ascending: false }),
      supabase.from('course_topics').select('id, course_id'),
    ]);

    const allUsers    = usersRes.data ?? [];
    const allLessons  = lessonsRes.data ?? [];
    const allProfiles = profilesRes.data ?? [];
    const allLevels   = levelsRes.data ?? [];
    const allCourses  = coursesRes.data ?? [];
    const allTopics   = topicsRes.data ?? [];

    setUsers(allUsers);
    setLessons(allLessons.map(l => ({
      id: l.id, title: l.title, is_published: l.is_published,
      level_key:   allLevels.find(lv => lv.id === l.level_id)?.key   ?? 'elementary',
      level_label: allLevels.find(lv => lv.id === l.level_id)?.label ?? '—',
      level_id:    l.level_id,
      teacher_name: allProfiles.find(p => p.id === l.teacher_id)?.full_name ?? 'Unknown',
      duration_minutes: l.duration_minutes,
      created_at: l.created_at,
      description: l.description ?? '',
    })));
    setLevelRows(allLevels.map(lv => ({
      id: lv.id, key: lv.key, label: lv.label,
      description: lv.description ?? '', sort_order: lv.sort_order,
      lesson_count:    allLessons.filter(l => l.level_id === lv.id).length,
      published_count: allLessons.filter(l => l.level_id === lv.id && l.is_published).length,
    })));
    setCourses(allCourses.map(c => ({
      id: c.id, title: c.title,
      description: c.description ?? '',
      thumbnail_url: c.thumbnail_url,
      pricing_model: c.pricing_model,
      visibility: c.visibility,
      difficulty_level: c.difficulty_level,
      is_published: c.is_published,
      created_at: c.created_at,
      topic_count: allTopics.filter(t => t.course_id === c.id).length,
    })));
    setStats({
      students:    allUsers.filter(u => u.role === 'student').length,
      teachers:    allUsers.filter(u => u.role === 'teacher').length,
      admins:      allUsers.filter(u => u.role === 'admin').length,
      lessons:     allLessons.length,
      published:   allLessons.filter(l => l.is_published).length,
      enrollments: enrRes.count ?? 0,
      completions: progRes.data?.length ?? 0,
    });
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleToggleLesson = async (id: string) => {
    const current = lessons.find(l => l.id === id);
    if (!current) return;
    const next = !current.is_published;
    await supabase.from('lessons').update({ is_published: next }).eq('id', id);
    setLessons(p => p.map(l => l.id === id ? { ...l, is_published: next } : l));
    setStats(s => ({ ...s, published: s.published + (next ? 1 : -1) }));
  };

  const handleDeleteLesson = async (id: string) => {
    await supabase.from('lessons').delete().eq('id', id);
    setLessons(p => p.filter(l => l.id !== id));
    setDeleteLesson(null);
  };

  const handleEditLesson = async (id: string, data: { title: string; description: string; duration_minutes: number; level_id: string; is_published: boolean }) => {
    await supabase.from('lessons').update(data).eq('id', id);
    const newLevelKey   = levelRows.find(l => l.id === data.level_id)?.key   ?? 'elementary';
    const newLevelLabel = levelRows.find(l => l.id === data.level_id)?.label ?? '—';
    setLessons(p => p.map(l => l.id === id ? { ...l, ...data, level_key: newLevelKey, level_label: newLevelLabel } : l));
    setEditLesson(null);
  };

  const handleChangeRole = async (userId: string, role: string) => {
    await supabase.from('profiles').update({ role }).eq('id', userId);
    setUsers(p => p.map(u => u.id === userId ? { ...u, role: role as Profile['role'] } : u));
  };

  const handleDeleteUser = async (userId: string) => {
    await supabase.from('profiles').delete().eq('id', userId);
    setUsers(p => p.filter(u => u.id !== userId));
    setDeleteUser(null);
  };

  const handleToggleCoursePublish = async (id: string) => {
    const current = courses.find(c => c.id === id);
    if (!current) return;
    const next = !current.is_published;
    await supabase.from('courses').update({ is_published: next }).eq('id', id);
    setCourses(p => p.map(c => c.id === id ? { ...c, is_published: next } : c));
  };

  const handleDeleteCourse = async (id: string) => {
    await supabase.from('courses').delete().eq('id', id);
    setCourses(p => p.filter(c => c.id !== id));
    setDeleteCourse(null);
  };

  const roleColors: Record<string, string> = {
    student: 'text-blue-700 bg-blue-50 border-blue-200',
    teacher: 'text-violet-700 bg-violet-50 border-violet-200',
    admin:   'text-rose-700 bg-rose-50 border-rose-200',
  };

  const filteredUsers   = users.filter(u =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );
  const filteredLessons = contentFilter === 'all'
    ? lessons
    : contentFilter === 'published'
      ? lessons.filter(l => l.is_published)
      : contentFilter === 'draft'
        ? lessons.filter(l => !l.is_published)
        : lessons.filter(l => l.level_id === contentFilter);

  const coursesMenuItems: ActionItem[] = [
    { icon: Plus,      label: 'Create New Course', onClick: () => setShowCourseBuilder(true) },
    { icon: FileText,  label: 'Import Courses',    onClick: () => {}, disabled: true, divider: true },
    { icon: RefreshCw, label: 'Refresh',           onClick: loadData, divider: true },
  ];

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <>
      <SidebarLayout
        items={navItems} active={page}
        onNavigate={k => setPage(k as AdminPage)}
        accentGradient="from-rose-500 to-red-600"
        accentText="text-rose-500"
      >
        <div className="p-5 sm:p-7 max-w-6xl mx-auto">

          {/* ── OVERVIEW ── */}
          {page === 'overview' && (
            <div className="space-y-7 animate-fadeInUp">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center shadow-lg">
                  <Shield size={22} className="text-white" />
                </div>
                <div>
                  <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">Admin Overview</h1>
                  <p className="text-slate-500 text-sm">Welcome back, {profile?.full_name}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { icon: GraduationCap, label: 'Students',    value: stats.students,    g: 'from-blue-500 to-blue-600' },
                  { icon: Users,         label: 'Teachers',    value: stats.teachers,    g: 'from-violet-500 to-purple-600' },
                  { icon: BookOpen,      label: 'Lessons',     value: stats.lessons,     g: 'from-amber-400 to-orange-500' },
                  { icon: CheckCircle,   label: 'Completions', value: stats.completions, g: 'from-emerald-400 to-teal-500' },
                  { icon: TrendingUp,    label: 'Published',   value: stats.published,   g: 'from-cyan-500 to-blue-500' },
                  { icon: Activity,      label: 'Enrollments', value: stats.enrollments, g: 'from-rose-500 to-red-500' },
                  { icon: Shield,        label: 'Admins',      value: stats.admins,      g: 'from-slate-500 to-slate-700' },
                  { icon: BarChart2,     label: 'Total Users', value: users.length,      g: 'from-fuchsia-500 to-pink-600' },
                ].map((s, i) => (
                  <div key={s.label} className={`rounded-2xl p-4 bg-gradient-to-br ${s.g} text-white shadow-md`} style={{ animationDelay: `${i * 0.05}s` }}>
                    <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                      <s.icon size={17} className="text-white" />
                    </div>
                    <div className="text-2xl font-black">{s.value}</div>
                    <div className="text-white/75 text-xs mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <h3 className="font-semibold text-slate-900 mb-4">User Distribution</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Students', count: stats.students, g: 'from-blue-400 to-blue-600' },
                      { label: 'Teachers', count: stats.teachers, g: 'from-violet-400 to-purple-600' },
                      { label: 'Admins',   count: stats.admins,   g: 'from-rose-400 to-red-600' },
                    ].map(r => (
                      <div key={r.label}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-slate-700">{r.label}</span>
                          <span className="text-slate-400">{r.count} / {users.length}</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full bg-gradient-to-r ${r.g} rounded-full`} style={{ width: users.length ? `${(r.count / users.length) * 100}%` : '0%', transition: 'width 0.8s' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <h3 className="font-semibold text-slate-900 mb-4">Content Health</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Published',      count: stats.published,                 total: Math.max(stats.lessons, 1), g: 'from-emerald-400 to-teal-500' },
                      { label: 'Drafts',         count: stats.lessons - stats.published, total: Math.max(stats.lessons, 1), g: 'from-amber-400 to-orange-500' },
                      { label: 'Completion Rate',count: stats.completions,              total: Math.max(stats.enrollments, 1), g: 'from-blue-400 to-blue-600' },
                    ].map(r => (
                      <div key={r.label}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-slate-700">{r.label}</span>
                          <span className="text-slate-400">{r.count} / {r.total}</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full bg-gradient-to-r ${r.g} rounded-full`} style={{ width: `${Math.min((r.count / r.total) * 100, 100)}%`, transition: 'width 0.8s' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                  <h2 className="font-semibold text-slate-900">Recent Users</h2>
                  <button onClick={() => setPage('users')} className="text-sm text-rose-600 font-medium flex items-center gap-1">View all <ChevronRight size={14} /></button>
                </div>
                <div className="divide-y divide-slate-50">
                  {users.slice(0, 5).map(u => (
                    <div key={u.id} className="px-5 py-3 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {u.full_name?.charAt(0)?.toUpperCase() ?? '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 text-sm truncate">{u.full_name || 'Unnamed'}</p>
                        <p className="text-xs text-slate-400">{new Date(u.created_at).toLocaleDateString()}</p>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize border ${roleColors[u.role]}`}>{u.role}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── USERS ── */}
          {page === 'users' && (
            <div className="space-y-5 animate-fadeInUp">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="font-display text-2xl font-bold text-slate-900">User Management</h1>
                  <p className="text-slate-500 text-sm mt-1">{users.length} total users</p>
                </div>
              </div>

              <div className="relative">
                <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search by name or role…"
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 transition shadow-sm" />
              </div>

              <div className="flex gap-2 flex-wrap">
                {[
                  { label: `All (${users.length})`,         key: 'all' },
                  { label: `Students (${stats.students})`,  key: 'student' },
                  { label: `Teachers (${stats.teachers})`,  key: 'teacher' },
                  { label: `Admins (${stats.admins})`,      key: 'admin' },
                ].map(f => (
                  <button key={f.key}
                    onClick={() => setSearch(f.key === 'all' ? '' : f.key)}
                    className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all ${
                      (f.key === 'all' && !search) || search === f.key
                        ? 'bg-rose-600 text-white shadow-md'
                        : 'bg-white border border-slate-200 text-slate-600 hover:border-rose-300'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {filteredUsers.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 p-14 text-center">
                  <UserX size={40} className="text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-500">No users found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredUsers.map(u => (
                    <div key={u.id} className="group bg-white rounded-2xl border border-slate-100 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all shadow-sm">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-black text-base flex-shrink-0">
                            {u.full_name?.charAt(0)?.toUpperCase() ?? '?'}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 text-sm truncate">{u.full_name || 'Unnamed'}</p>
                            <p className="text-xs text-slate-400">{new Date(u.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <UserActionMenu
                          user={u}
                          onChangeRole={role => handleChangeRole(u.id, role)}
                          onDelete={() => setDeleteUser(u)}
                        />
                      </div>
                      <span className={`inline-flex items-center text-xs font-bold px-3 py-1 rounded-full capitalize border ${roleColors[u.role]}`}>
                        {u.role === 'admin'   && <Crown size={11} className="mr-1" />}
                        {u.role === 'teacher' && <BookOpen size={11} className="mr-1" />}
                        {u.role === 'student' && <GraduationCap size={11} className="mr-1" />}
                        {u.role}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── CONTENT ── */}
          {page === 'content' && (
            <div className="space-y-6 animate-fadeInUp">
              <div>
                <h1 className="font-display text-2xl font-bold text-slate-900">Content Management</h1>
                <p className="text-slate-500 text-sm mt-1">{lessons.length} lessons · {stats.published} published</p>
              </div>

              <div className="flex gap-2 flex-wrap">
                {[
                  { key: 'all',       label: `All (${lessons.length})` },
                  { key: 'published', label: `Published (${stats.published})` },
                  { key: 'draft',     label: `Drafts (${lessons.length - stats.published})` },
                  ...levelRows.map(lv => ({ key: lv.id, label: `${LEVEL_META[lv.key]?.emoji ?? ''} ${lv.label} (${lv.lesson_count})` })),
                ].map(f => (
                  <button key={f.key}
                    onClick={() => setContentFilter(f.key)}
                    className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all ${
                      contentFilter === f.key
                        ? 'bg-rose-600 text-white shadow-md'
                        : 'bg-white border border-slate-200 text-slate-600 hover:border-rose-300'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {filteredLessons.length === 0 ? (
                <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-16 text-center">
                  <BookOpen size={44} className="text-slate-200 mx-auto mb-4" />
                  <p className="font-semibold text-slate-500">No lessons found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {filteredLessons.map(lesson => (
                    <AdminLessonCard
                      key={lesson.id}
                      lesson={lesson}
                      onToggle={() => handleToggleLesson(lesson.id)}
                      onEdit={() => setEditLesson(lesson)}
                      onDelete={() => setDeleteLesson(lesson)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── COURSES (Course Builder) ── */}
          {page === 'courses' && (
            <div className="space-y-6 animate-fadeInUp">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h1 className="font-display text-2xl font-bold text-slate-900">Courses Management</h1>
                  <p className="text-slate-500 text-sm mt-1">
                    {courses.length} {courses.length === 1 ? 'course' : 'courses'} · {courses.filter(c => c.is_published).length} published
                  </p>
                </div>
                <ActionMenu items={coursesMenuItems} align="right" />
              </div>

              {courses.length === 0 ? (
                <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-16 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center mx-auto mb-4">
                    <Layers size={32} className="text-rose-300" />
                  </div>
                  <p className="font-semibold text-slate-600 mb-1">No courses yet</p>
                  <p className="text-sm text-slate-400 mb-5">Create your first course using the Course Builder</p>
                  <button
                    onClick={() => setShowCourseBuilder(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-xl transition-colors shadow"
                  >
                    <Plus size={15} /> Create New Course
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {courses.map(course => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      onEdit={() => {}}
                      onDelete={() => setDeleteCourse(course)}
                      onTogglePublish={() => handleToggleCoursePublish(course.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── SETTINGS ── */}
          {page === 'settings' && (
            <div className="space-y-6 animate-fadeInUp">
              <h1 className="font-display text-2xl font-bold text-slate-900">Platform Settings</h1>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-100">
                {[
                  { label: 'Platform Name',         value: 'LingoRise', desc: 'The public name of the platform' },
                  { label: 'Default Language',       value: 'English',   desc: 'Primary teaching language' },
                  { label: 'Max Levels',             value: '5',         desc: 'Number of learning levels' },
                  { label: 'Allow Self-Enrollment',  value: 'Enabled',   desc: 'Students can enroll in levels themselves' },
                  { label: 'Email Confirmation',     value: 'Disabled',  desc: 'Require email verification on signup' },
                ].map(s => (
                  <div key={s.label} className="px-5 py-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{s.label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{s.desc}</p>
                    </div>
                    <span className="text-sm font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-xl">{s.value}</span>
                  </div>
                ))}
              </div>
              <div className="bg-rose-50 border border-rose-100 rounded-2xl p-5">
                <h3 className="font-semibold text-rose-700 mb-1">Danger Zone</h3>
                <p className="text-sm text-rose-600 mb-4">These actions are irreversible. Proceed with caution.</p>
                <button disabled className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-xl opacity-50 cursor-not-allowed">
                  Reset All Data
                </button>
              </div>
            </div>
          )}

        </div>
      </SidebarLayout>

      {/* ── Modals ── */}
      {deleteLesson && (
        <DeleteModal
          title="Delete Lesson?"
          body={`"${deleteLesson.title}" will be permanently removed.`}
          onConfirm={() => handleDeleteLesson(deleteLesson.id)}
          onCancel={() => setDeleteLesson(null)}
        />
      )}
      {deleteUser && (
        <DeleteModal
          title="Delete User?"
          body={`"${deleteUser.full_name}" will be permanently removed from the platform.`}
          onConfirm={() => handleDeleteUser(deleteUser.id)}
          onCancel={() => setDeleteUser(null)}
        />
      )}
      {deleteCourse && (
        <DeleteModal
          title="Delete Course?"
          body={`"${deleteCourse.title}" and all its topics will be permanently removed.`}
          onConfirm={() => handleDeleteCourse(deleteCourse.id)}
          onCancel={() => setDeleteCourse(null)}
        />
      )}
      {editLesson && (
        <EditLessonModal
          lesson={editLesson}
          levels={levelRows}
          onSave={handleEditLesson}
          onClose={() => setEditLesson(null)}
        />
      )}

      {/* Course Builder full-screen */}
      {showCourseBuilder && profile && (
        <CourseBuilderModal
          authorId={profile.id}
          onClose={() => setShowCourseBuilder(false)}
          onSaved={course => setCourses(prev => [course, ...prev])}
        />
      )}
    </>
  );
}
