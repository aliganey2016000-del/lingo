import { useEffect, useState } from 'react';
import {
  LayoutDashboard, BookOpen, CheckCircle, Star, Clock, Lock, Play,
  TrendingUp, Zap, ArrowRight, Award, RotateCcw, ChevronRight,
  Flame, GraduationCap, BarChart2, ArrowLeft, Users, Trophy,
  Volume2, Globe, MessageSquare, PenTool, Headphones,
} from 'lucide-react';
import SidebarLayout, { NavItem } from '../components/SidebarLayout';
import { useAuth } from '../lib/AuthContext';
import { supabase, Level, Lesson, LessonProgress, Enrollment } from '../lib/supabase';

type StudentPage = 'overview' | 'courses' | 'progress' | 'vocabulary' | 'quiz';

const LEVEL_META: Record<string, {
  gradient: string;
  lightGradient: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
  shadowColor: string;
  badgeClass: string;
  coverImage: string;
  emoji: string;
  accentHex: string;
}> = {
  elementary: {
    gradient: 'from-emerald-500 to-teal-600',
    lightGradient: 'from-emerald-50 to-teal-50',
    textColor: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    shadowColor: 'shadow-emerald-100',
    badgeClass: 'bg-emerald-100 text-emerald-700',
    coverImage: 'https://images.pexels.com/photos/256395/pexels-photo-256395.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop',
    emoji: '🌱',
    accentHex: '#10b981',
  },
  'pre-intermediate': {
    gradient: 'from-sky-500 to-blue-600',
    lightGradient: 'from-sky-50 to-blue-50',
    textColor: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    shadowColor: 'shadow-blue-100',
    badgeClass: 'bg-blue-100 text-blue-700',
    coverImage: 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop',
    emoji: '📖',
    accentHex: '#0ea5e9',
  },
  intermediate: {
    gradient: 'from-violet-500 to-purple-700',
    lightGradient: 'from-violet-50 to-purple-50',
    textColor: 'text-violet-700',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-200',
    shadowColor: 'shadow-violet-100',
    badgeClass: 'bg-violet-100 text-violet-700',
    coverImage: 'https://images.pexels.com/photos/301926/pexels-photo-301926.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop',
    emoji: '⚡',
    accentHex: '#8b5cf6',
  },
  'upper-intermediate': {
    gradient: 'from-amber-500 to-orange-600',
    lightGradient: 'from-amber-50 to-orange-50',
    textColor: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    shadowColor: 'shadow-amber-100',
    badgeClass: 'bg-amber-100 text-amber-700',
    coverImage: 'https://images.pexels.com/photos/267669/pexels-photo-267669.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop',
    emoji: '🚀',
    accentHex: '#f59e0b',
  },
  advanced: {
    gradient: 'from-rose-500 to-red-700',
    lightGradient: 'from-rose-50 to-red-50',
    textColor: 'text-rose-700',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
    shadowColor: 'shadow-rose-100',
    badgeClass: 'bg-rose-100 text-rose-700',
    coverImage: 'https://images.pexels.com/photos/1438072/pexels-photo-1438072.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&fit=crop',
    emoji: '🏆',
    accentHex: '#f43f5e',
  },
};

const LEVEL_SKILLS: Record<string, { icon: React.ElementType; label: string }[]> = {
  elementary:          [{ icon: MessageSquare, label: 'Basic Conversations' }, { icon: BookOpen, label: 'Simple Vocabulary' }, { icon: Volume2, label: 'Pronunciation Basics' }, { icon: PenTool, label: 'Simple Writing' }],
  'pre-intermediate':  [{ icon: Globe, label: 'Everyday Topics' }, { icon: Headphones, label: 'Listening Skills' }, { icon: MessageSquare, label: 'Short Dialogues' }, { icon: PenTool, label: 'Paragraph Writing' }],
  intermediate:        [{ icon: MessageSquare, label: 'Fluent Discussion' }, { icon: BookOpen, label: 'Complex Grammar' }, { icon: PenTool, label: 'Essay Writing' }, { icon: Globe, label: 'News & Media' }],
  'upper-intermediate':[{ icon: Trophy, label: 'Academic English' }, { icon: MessageSquare, label: 'Debates & Arguments' }, { icon: PenTool, label: 'Business Writing' }, { icon: Globe, label: 'Cultural Nuances' }],
  advanced:            [{ icon: Trophy, label: 'Native-Level Fluency' }, { icon: MessageSquare, label: 'Rhetoric & Style' }, { icon: PenTool, label: 'Research Writing' }, { icon: Globe, label: 'Professional Use' }],
};

const LEVEL_DESCRIPTION: Record<string, string> = {
  elementary:          'Perfect for beginners. Learn greetings, numbers, colors, and basic daily conversations to build a solid foundation.',
  'pre-intermediate':  'Expand your vocabulary and tackle everyday topics like travel, shopping, hobbies, and describing people.',
  intermediate:        'Develop fluency with complex grammar, idioms, and the ability to discuss a wide range of subjects confidently.',
  'upper-intermediate':'Master academic and business English, engage in debates, and handle nuanced professional communication.',
  advanced:            'Achieve near-native fluency with advanced rhetoric, professional writing, and critical analytical skills.',
};

const navItems: NavItem[] = [
  { key: 'overview',   label: 'Overview',   icon: LayoutDashboard },
  { key: 'courses',    label: 'Courses',    icon: BookOpen },
  { key: 'progress',   label: 'Progress',   icon: TrendingUp },
  { key: 'vocabulary', label: 'Vocabulary', icon: Star },
  { key: 'quiz',       label: 'Quick Quiz', icon: Zap },
];

const VOCAB = [
  { word: 'Ambitious',   phonetic: '/æmˈbɪʃəs/',    meaning: 'Having a strong desire to succeed',  example: 'She is an ambitious student.',         level: 'Intermediate' },
  { word: 'Persevere',   phonetic: '/ˌpɜːsɪˈvɪər/', meaning: 'To continue despite difficulty',      example: 'You must persevere to achieve goals.', level: 'Upper-Int.' },
  { word: 'Eloquent',    phonetic: '/ˈelɪkwənt/',    meaning: 'Fluent and persuasive in speaking',   example: 'The speaker was very eloquent.',        level: 'Advanced' },
  { word: 'Diligent',    phonetic: '/ˈdɪlɪdʒənt/',   meaning: 'Hardworking and careful',             example: 'He is a diligent learner.',             level: 'Intermediate' },
  { word: 'Acknowledge', phonetic: '/əkˈnɒlɪdʒ/',    meaning: 'To accept or admit the truth',        example: 'She acknowledged her mistake.',         level: 'Pre-Int.' },
  { word: 'Greet',       phonetic: '/ɡriːt/',         meaning: 'To say hello to someone',             example: 'He greeted his teacher warmly.',        level: 'Elementary' },
];

const QUIZ = [
  { q: 'Choose the correct sentence:', options: ['She go to school every day.', 'She goes to school every day.', 'She going to school every day.', 'She gone to school every day.'], answer: 1, explanation: 'Third person singular uses "goes" in simple present tense.' },
  { q: 'What is the past tense of "write"?', options: ['Writed', 'Wrote', 'Written', 'Writ'], answer: 1, explanation: '"Write" is irregular — the past tense is "wrote".' },
  { q: 'Which word means "very happy"?', options: ['Sad', 'Angry', 'Elated', 'Tired'], answer: 2, explanation: '"Elated" means extremely happy or pleased.' },
  { q: 'Fill in: She __ studying for two hours.', options: ['is', 'was', 'has been', 'have been'], answer: 2, explanation: '"Has been studying" is present perfect continuous.' },
  { q: 'Which is a correct question form?', options: ['Where you live?', 'Where do you live?', 'Where you do live?', 'Do where you live?'], answer: 1, explanation: 'Use "do/does" to form present simple questions.' },
];

// ── Course Card ──────────────────────────────────────────────────────────────
function CourseCard({
  level, lessons, progress, enrollments, onOpen, onEnroll,
}: {
  level: Level;
  lessons: Lesson[];
  progress: LessonProgress[];
  enrollments: Enrollment[];
  onOpen: () => void;
  onEnroll: (e: React.MouseEvent) => void;
}) {
  const m        = LEVEL_META[level.key] ?? LEVEL_META['elementary'];
  const lls      = lessons.filter(l => l.level_id === level.id);
  const done     = lls.filter(l => progress.find(p => p.lesson_id === l.id && p.completed)).length;
  const pct      = lls.length ? Math.round((done / lls.length) * 100) : 0;
  const enrolled = enrollments.some(e => e.level_id === level.id);
  const totalMin = lls.reduce((a, l) => a + l.duration_minutes, 0);
  const isFinished = enrolled && lls.length > 0 && done === lls.length;

  return (
    <div
      onClick={onOpen}
      className="group relative bg-white rounded-3xl overflow-hidden border border-slate-100 cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-transparent"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
    >
      {/* Cover image */}
      <div className="relative h-44 overflow-hidden">
        <img
          src={m.coverImage}
          alt={level.label}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        {/* Colour tint */}
        <div className={`absolute inset-0 bg-gradient-to-br ${m.gradient} opacity-25`} />

        {/* Top badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span className="text-xs font-bold text-white/90 bg-black/30 backdrop-blur-sm px-2.5 py-1 rounded-full">
            Level {level.sort_order ?? '—'}
          </span>
          {isFinished ? (
            <span className="flex items-center gap-1 text-xs font-bold text-white bg-emerald-500 px-2.5 py-1 rounded-full">
              <Trophy size={10} /> Completed
            </span>
          ) : enrolled ? (
            <span className="text-xs font-bold text-white bg-blue-500 px-2.5 py-1 rounded-full">In Progress</span>
          ) : null}
        </div>

        {/* Title block */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl drop-shadow-lg">{m.emoji}</span>
            <div>
              <h3 className="font-black text-white text-lg leading-tight drop-shadow-sm">{level.label}</h3>
              <p className="text-white/70 text-xs mt-0.5">{lls.length} lessons · {totalMin}m total</p>
            </div>
          </div>
        </div>
      </div>

      {/* Card body */}
      <div className="p-5">
        {/* Description */}
        <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mb-4 min-h-[2.5rem]">
          {LEVEL_DESCRIPTION[level.key] ?? level.description}
        </p>

        {/* Skill chips */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {(LEVEL_SKILLS[level.key] ?? []).slice(0, 3).map(s => (
            <span key={s.label} className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${m.badgeClass}`}>
              <s.icon size={10} />
              {s.label}
            </span>
          ))}
        </div>

        {/* Progress or enroll */}
        {enrolled ? (
          <div className="space-y-2.5">
            <div className="flex justify-between items-center text-xs text-slate-500">
              <span>{done} of {lls.length} lessons done</span>
              <span className={`font-bold text-sm ${m.textColor}`}>{pct}%</span>
            </div>
            <div className="relative h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`absolute inset-y-0 left-0 bg-gradient-to-r ${m.gradient} rounded-full transition-all duration-700`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <button
              onClick={e => { e.stopPropagation(); onOpen(); }}
              className={`w-full mt-1 py-2.5 bg-gradient-to-r ${m.gradient} text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity`}
            >
              {isFinished
                ? <><Trophy size={15} /> Review Course</>
                : <><Play size={13} className="fill-white" /> Continue Learning</>
              }
              <ArrowRight size={14} className="ml-auto" />
            </button>
          </div>
        ) : (
          <button
            onClick={onEnroll}
            className={`w-full py-2.5 bg-gradient-to-r ${m.gradient} text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-all hover:shadow-lg group-hover:gap-3`}
            style={{ boxShadow: `0 4px 14px ${m.accentHex}40` }}
          >
            Enroll Free — Start Now
            <ArrowRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

// ── Lesson Detail ────────────────────────────────────────────────────────────
function CourseDetail({
  level, lessons, progress, enrollments,
  onBack, onEnroll, onComplete,
}: {
  level: Level;
  lessons: Lesson[];
  progress: LessonProgress[];
  enrollments: Enrollment[];
  onBack: () => void;
  onEnroll: () => void;
  onComplete: (id: string) => void;
}) {
  const m        = LEVEL_META[level.key] ?? LEVEL_META['elementary'];
  const lls      = lessons.filter(l => l.level_id === level.id).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  const enrolled = enrollments.some(e => e.level_id === level.id);
  const done     = lls.filter(l => progress.find(p => p.lesson_id === l.id && p.completed)).length;
  const pct      = lls.length ? Math.round((done / lls.length) * 100) : 0;
  const totalMin = lls.reduce((a, l) => a + l.duration_minutes, 0);

  return (
    <div className="min-h-full">
      {/* ── Hero ── */}
      <div className="relative h-64 sm:h-72 overflow-hidden">
        <img src={m.coverImage} alt={level.label} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
        <div className={`absolute inset-0 bg-gradient-to-br ${m.gradient} opacity-30`} />

        {/* Back btn */}
        <button
          onClick={onBack}
          className="absolute top-5 left-5 flex items-center gap-2 px-3 py-1.5 bg-black/30 backdrop-blur-sm text-white/90 text-sm font-medium rounded-xl border border-white/10 hover:bg-black/50 transition-all"
        >
          <ArrowLeft size={15} /> Back to Courses
        </button>

        <div className="absolute bottom-0 left-0 right-0 px-6 pb-6">
          <span className="inline-block text-xs font-bold text-white/60 uppercase tracking-widest mb-2">
            English Course · Level {level.sort_order}
          </span>
          <div className="flex items-end justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl drop-shadow-lg">{m.emoji}</span>
              <h1 className="font-black text-3xl sm:text-4xl text-white leading-tight">{level.label}</h1>
            </div>
            {enrolled && (
              <div className="hidden sm:block text-right flex-shrink-0">
                <div className="text-3xl font-black text-white">{pct}%</div>
                <div className="text-white/50 text-xs">completed</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* ── Info bar ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            {/* Stats */}
            <div className="flex flex-wrap gap-5 flex-1">
              {[
                { icon: BookOpen,    label: 'Lessons',      value: lls.length },
                { icon: Clock,       label: 'Total time',   value: `${totalMin}m` },
                { icon: CheckCircle, label: 'Completed',    value: done },
                { icon: Users,       label: 'Level',        value: level.label },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-2 text-sm text-slate-600">
                  <s.icon size={15} className={m.textColor} />
                  <span className="font-bold text-slate-900">{s.value}</span>
                  <span className="text-slate-400">{s.label}</span>
                </div>
              ))}
            </div>
            {/* CTA */}
            {!enrolled ? (
              <button
                onClick={onEnroll}
                className={`flex-shrink-0 px-6 py-2.5 bg-gradient-to-r ${m.gradient} text-white font-bold text-sm rounded-xl shadow-lg hover:opacity-90 transition-all hover:-translate-y-0.5`}
                style={{ boxShadow: `0 6px 20px ${m.accentHex}40` }}
              >
                Enroll Free
              </button>
            ) : (
              <span className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 ${m.bgColor} ${m.textColor} text-sm font-bold rounded-xl border ${m.borderColor}`}>
                <CheckCircle size={15} /> Enrolled
              </span>
            )}
          </div>

          {enrolled && (
            <div className="mt-5 pt-5 border-t border-slate-100">
              <div className="flex justify-between text-xs text-slate-500 mb-2">
                <span>Course progress</span>
                <span className={`font-bold text-sm ${m.textColor}`}>{pct}%</span>
              </div>
              <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`absolute inset-y-0 left-0 bg-gradient-to-r ${m.gradient} rounded-full transition-all duration-700`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-xs text-slate-400 mt-1.5">{done} of {lls.length} lessons completed</p>
            </div>
          )}
        </div>

        {/* ── What you'll learn ── */}
        <div className={`rounded-2xl bg-gradient-to-br ${m.lightGradient} border ${m.borderColor} p-5`}>
          <h2 className="font-bold text-slate-900 mb-3">What you'll learn</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {(LEVEL_SKILLS[level.key] ?? []).map(s => (
              <div key={s.label} className="flex items-center gap-2.5 text-sm text-slate-700">
                <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${m.gradient} flex items-center justify-center flex-shrink-0`}>
                  <s.icon size={12} className="text-white" />
                </div>
                {s.label}
              </div>
            ))}
          </div>
        </div>

        {/* ── Lessons list ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900 text-lg">
              Course Content
            </h2>
            <span className="text-sm text-slate-400">{lls.length} lessons · {totalMin} min</span>
          </div>

          {lls.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-16 text-center">
              <BookOpen size={44} className="text-slate-200 mx-auto mb-4" />
              <p className="font-semibold text-slate-500">No lessons yet</p>
              <p className="text-slate-400 text-sm mt-1">Teachers are preparing content — check back soon!</p>
            </div>
          ) : (
            <div className="space-y-0 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              {lls.map((lesson, i) => {
                const lp       = progress.find(p => p.lesson_id === lesson.id);
                const isDone   = !!lp?.completed;
                const isLocked = !enrolled;
                const isNext   = !isDone && !isLocked && lls.slice(0, i).every(l => progress.find(p => p.lesson_id === l.id && p.completed));

                return (
                  <div
                    key={lesson.id}
                    onClick={() => !isLocked && !isDone && onComplete(lesson.id)}
                    className={[
                      'group flex items-center gap-0 transition-all border-b border-slate-50 last:border-0',
                      isDone   ? 'bg-white hover:bg-emerald-50/50 cursor-default' : '',
                      isLocked ? 'opacity-60 cursor-not-allowed' : '',
                      isNext   ? 'cursor-pointer hover:bg-blue-50/60' : '',
                      !isDone && !isLocked && !isNext ? 'cursor-pointer hover:bg-slate-50' : '',
                    ].join(' ')}
                  >
                    {/* Left accent bar */}
                    <div className={`w-1 self-stretch flex-shrink-0 transition-all ${isDone ? `bg-gradient-to-b ${m.gradient}` : isNext ? `bg-gradient-to-b ${m.gradient} opacity-40` : 'bg-transparent'}`} />

                    <div className="flex items-center gap-4 px-5 py-4 w-full">
                      {/* Icon */}
                      <div className={[
                        'w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all',
                        isDone   ? 'bg-emerald-100' : '',
                        isLocked ? 'bg-slate-100' : '',
                        isNext   ? `bg-gradient-to-br ${m.gradient} shadow-md group-hover:shadow-lg` : '',
                        !isDone && !isLocked && !isNext ? 'bg-slate-100 group-hover:bg-slate-200' : '',
                      ].join(' ')}>
                        {isDone   && <CheckCircle size={20} className="text-emerald-500" />}
                        {isLocked && <Lock size={16} className="text-slate-400" />}
                        {isNext   && <Play size={16} className="text-white fill-white" />}
                        {!isDone && !isLocked && !isNext && <Play size={16} className="text-slate-400" />}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <span className="text-xs text-slate-400 font-medium">Lesson {i + 1}</span>
                          {isDone && <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">Completed</span>}
                          {isNext && <span className={`text-xs font-bold ${m.textColor} ${m.bgColor} px-1.5 py-0.5 rounded-md`}>Up Next</span>}
                        </div>
                        <h3 className={`font-semibold text-sm leading-snug ${isDone ? 'text-slate-500' : 'text-slate-900'}`}>
                          {lesson.title}
                        </h3>
                        {lesson.description && (
                          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{lesson.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="flex items-center gap-1 text-xs text-slate-400">
                            <Clock size={11} /> {lesson.duration_minutes} min
                          </span>
                          {isDone && lp?.score !== undefined && (
                            <span className="flex items-center gap-1 text-xs text-amber-500 font-medium">
                              <Star size={11} className="fill-amber-400 text-amber-400" /> {lp.score}%
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right action */}
                      <div className="flex-shrink-0">
                        {isLocked && <Lock size={15} className="text-slate-300" />}
                        {isDone && (
                          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                            <CheckCircle size={16} className="text-emerald-500" />
                          </div>
                        )}
                        {isNext && (
                          <div className={`flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r ${m.gradient} text-white text-xs font-bold rounded-xl`}>
                            Start <ArrowRight size={11} />
                          </div>
                        )}
                        {!isDone && !isLocked && !isNext && (
                          <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function StudentDashboard() {
  const { profile, user } = useAuth();
  const [page, setPage]   = useState<StudentPage>('overview');

  const [levels, setLevels]           = useState<Level[]>([]);
  const [lessons, setLessons]         = useState<Lesson[]>([]);
  const [progress, setProgress]       = useState<LessonProgress[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading]         = useState(true);
  const [openLevelId, setOpenLevelId] = useState<string | null>(null);

  const [flippedCard, setFlippedCard] = useState<number | null>(null);
  const [quizIdx, setQuizIdx]         = useState(0);
  const [selected, setSelected]       = useState<number | null>(null);
  const [quizScore, setQuizScore]     = useState(0);
  const [quizDone, setQuizDone]       = useState(false);
  const [showExp, setShowExp]         = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [lvl, les, prog, enr] = await Promise.all([
        supabase.from('levels').select('*').order('sort_order'),
        supabase.from('lessons').select('*').eq('is_published', true).order('sort_order'),
        supabase.from('lesson_progress').select('*').eq('student_id', user.id),
        supabase.from('enrollments').select('*').eq('student_id', user.id),
      ]);
      setLevels(lvl.data ?? []);
      setLessons(les.data ?? []);
      setProgress(prog.data ?? []);
      setEnrollments(enr.data ?? []);
      setLoading(false);
    })();
  }, [user]);

  const enroll = async (levelId: string) => {
    if (!user) return;
    const already = enrollments.some(e => e.level_id === levelId);
    if (already) return;
    const { data } = await supabase
      .from('enrollments')
      .insert({ student_id: user.id, level_id: levelId })
      .select().maybeSingle();
    if (data) setEnrollments(p => [...p, data]);
  };

  const completeLesson = async (lessonId: string) => {
    if (!user) return;
    if (progress.find(p => p.lesson_id === lessonId)) return;
    const { data } = await supabase.from('lesson_progress').insert({
      student_id: user.id, lesson_id: lessonId,
      score: 100, completed: true, completed_at: new Date().toISOString(),
    }).select().maybeSingle();
    if (data) setProgress(p => [...p, data]);
  };

  const completedCount = progress.filter(p => p.completed).length;
  const overallPct     = lessons.length ? Math.round((completedCount / lessons.length) * 100) : 0;
  const streak         = Math.min(completedCount * 2 + 1, 30);

  const handleQuiz = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx); setShowExp(true);
    if (idx === QUIZ[quizIdx].answer) setQuizScore(s => s + 1);
  };
  const nextQ = () => {
    if (quizIdx + 1 >= QUIZ.length) { setQuizDone(true); return; }
    setQuizIdx(i => i + 1); setSelected(null); setShowExp(false);
  };
  const resetQuiz = () => { setQuizIdx(0); setSelected(null); setQuizScore(0); setQuizDone(false); setShowExp(false); };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  // ── Course detail fullscreen ──────────────────────────────────────────────
  if (openLevelId) {
    const lv = levels.find(l => l.id === openLevelId);
    if (!lv) { setOpenLevelId(null); return null; }
    return (
      <SidebarLayout
        items={navItems} active="courses"
        onNavigate={k => { setPage(k as StudentPage); setOpenLevelId(null); }}
        accentGradient="from-blue-500 to-cyan-500" accentText="text-blue-500"
      >
        <CourseDetail
          level={lv}
          lessons={lessons}
          progress={progress}
          enrollments={enrollments}
          onBack={() => setOpenLevelId(null)}
          onEnroll={() => enroll(lv.id)}
          onComplete={completeLesson}
        />
      </SidebarLayout>
    );
  }

  // ── Main layout ───────────────────────────────────────────────────────────
  return (
    <SidebarLayout
      items={navItems} active={page}
      onNavigate={k => setPage(k as StudentPage)}
      accentGradient="from-blue-500 to-cyan-500" accentText="text-blue-500"
    >
      <div className="p-5 sm:p-7 max-w-5xl mx-auto">

        {/* ── OVERVIEW ────────────────────────────────────────────── */}
        {page === 'overview' && (
          <div className="space-y-7 animate-fadeInUp">
            {/* Greeting */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
                  Welcome back, <span className="text-blue-600">{profile?.full_name?.split(' ')[0] ?? 'Learner'}</span>!
                </h1>
                <p className="text-slate-500 mt-1 text-sm">Continue your English journey today.</p>
              </div>
              <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-200">
                <GraduationCap size={22} className="text-white" />
              </div>
            </div>

            {/* KPI cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: CheckCircle,   label: 'Lessons Done',    value: completedCount,      g: 'from-emerald-400 to-teal-500' },
                { icon: TrendingUp,    label: 'Overall Progress', value: `${overallPct}%`,   g: 'from-blue-400 to-blue-600' },
                { icon: Flame,         label: 'Day Streak',       value: `${streak}d`,       g: 'from-orange-400 to-red-500' },
                { icon: GraduationCap, label: 'Levels Enrolled',  value: enrollments.length, g: 'from-violet-400 to-purple-600' },
              ].map((s, i) => (
                <div key={s.label} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm" style={{ animationDelay: `${i * 0.07}s` }}>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.g} flex items-center justify-center mb-3`}>
                    <s.icon size={18} className="text-white" strokeWidth={2} />
                  </div>
                  <div className="text-xl font-bold text-slate-900">{s.value}</div>
                  <div className="text-xs text-slate-500">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Master progress bar */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <h2 className="font-semibold text-slate-900">Overall Progress</h2>
                <span className="text-blue-600 font-bold">{overallPct}%</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-700" style={{ width: `${overallPct}%` }} />
              </div>
              <p className="text-xs text-slate-400 mt-2">{completedCount} of {lessons.length} lessons completed</p>
            </div>

            {/* Course preview cards */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-slate-900">Your Courses</h2>
                <button
                  onClick={() => setPage('courses')}
                  className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1"
                >
                  View all <ChevronRight size={14} />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {levels.slice(0, 4).map(level => {
                  const m        = LEVEL_META[level.key] ?? LEVEL_META['elementary'];
                  const lls      = lessons.filter(l => l.level_id === level.id);
                  const done     = lls.filter(l => progress.find(p => p.lesson_id === l.id && p.completed)).length;
                  const pct      = lls.length ? Math.round((done / lls.length) * 100) : 0;
                  const enrolled = enrollments.some(e => e.level_id === level.id);
                  return (
                    <button
                      key={level.id}
                      onClick={() => { setPage('courses'); setOpenLevelId(level.id); }}
                      className="group bg-white rounded-2xl p-4 border border-slate-100 text-left hover:border-blue-200 hover:shadow-md transition-all hover:-translate-y-0.5"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${m.gradient} flex items-center justify-center text-lg shadow-sm`}>
                          {m.emoji}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 text-sm">{level.label}</p>
                          <p className="text-xs text-slate-400">{lls.length} lessons</p>
                        </div>
                        {enrolled
                          ? <span className="ml-auto text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex-shrink-0">Enrolled</span>
                          : <ArrowRight size={14} className="ml-auto text-slate-300 group-hover:text-blue-500 transition-colors flex-shrink-0" />
                        }
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full bg-gradient-to-r ${m.gradient} rounded-full`} style={{ width: `${pct}%`, transition: 'width 0.5s' }} />
                      </div>
                      <p className={`text-xs font-semibold mt-1.5 ${m.textColor}`}>{pct}% complete</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── COURSES ─────────────────────────────────────────────── */}
        {page === 'courses' && (
          <div className="space-y-6 animate-fadeInUp">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">English Courses</h1>
              <p className="text-slate-500 text-sm mt-1">Choose a course and start your learning journey</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {levels.map((level) => (
                <CourseCard
                  key={level.id}
                  level={level}
                  lessons={lessons}
                  progress={progress}
                  enrollments={enrollments}
                  onOpen={() => setOpenLevelId(level.id)}
                  onEnroll={e => { e.stopPropagation(); enroll(level.id); }}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── PROGRESS ─────────────────────────────────────────────── */}
        {page === 'progress' && (
          <div className="space-y-6 animate-fadeInUp">
            <h1 className="font-display text-2xl font-bold text-slate-900">My Progress</h1>

            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-slate-900">Overall Completion</span>
                <span className="text-2xl font-black text-blue-600">{overallPct}%</span>
              </div>
              <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-1000" style={{ width: `${overallPct}%` }} />
              </div>
              <div className="flex justify-between text-xs text-slate-400 mt-2">
                <span>{completedCount} completed</span>
                <span>{lessons.length - completedCount} remaining</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: Award,     label: 'Completed',  value: completedCount, cls: 'text-emerald-600 bg-emerald-50' },
                { icon: Flame,     label: 'Day Streak', value: `${streak}d`,   cls: 'text-orange-600 bg-orange-50' },
                { icon: BarChart2, label: 'Avg Score',  value: progress.length ? Math.round(progress.reduce((a, p) => a + p.score, 0) / progress.length) + '%' : '—', cls: 'text-blue-600 bg-blue-50' },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-2xl p-4 border border-slate-100 text-center shadow-sm">
                  <div className={`w-10 h-10 rounded-xl ${s.cls} flex items-center justify-center mx-auto mb-2`}><s.icon size={18} /></div>
                  <div className="text-xl font-bold text-slate-900">{s.value}</div>
                  <div className="text-xs text-slate-500">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              {levels.map(level => {
                const m    = LEVEL_META[level.key] ?? LEVEL_META['elementary'];
                const lls  = lessons.filter(l => l.level_id === level.id);
                const done = lls.filter(l => progress.find(p => p.lesson_id === l.id && p.completed)).length;
                const pct  = lls.length ? Math.round((done / lls.length) * 100) : 0;
                return (
                  <div key={level.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{m.emoji}</span>
                        <span className="font-semibold text-slate-800 text-sm">{level.label}</span>
                      </div>
                      <span className={`text-sm font-bold ${m.textColor}`}>{pct}%</span>
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full bg-gradient-to-r ${m.gradient} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-xs text-slate-400 mt-1.5">{done} of {lls.length} lessons</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── VOCABULARY ───────────────────────────────────────────── */}
        {page === 'vocabulary' && (
          <div className="space-y-6 animate-fadeInUp">
            <div>
              <h1 className="font-display text-2xl font-bold text-slate-900">Vocabulary</h1>
              <p className="text-slate-500 text-sm mt-0.5">Click a card to flip and reveal the meaning</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {VOCAB.map((v, i) => (
                <div
                  key={i}
                  onClick={() => setFlippedCard(flippedCard === i ? null : i)}
                  className="cursor-pointer h-44"
                  style={{ perspective: '1000px' }}
                >
                  <div
                    className="relative w-full h-full"
                    style={{
                      transformStyle: 'preserve-3d',
                      transition: 'transform 0.55s cubic-bezier(0.4,0,0.2,1)',
                      transform: flippedCard === i ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    }}
                  >
                    {/* Front */}
                    <div
                      className="absolute inset-0 bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col justify-between"
                      style={{ backfaceVisibility: 'hidden' }}
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="font-black text-slate-900 text-2xl">{v.word}</h3>
                        <span className="text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full font-semibold">{v.level}</span>
                      </div>
                      <div>
                        <p className="text-slate-400 font-mono text-sm">{v.phonetic}</p>
                        <p className="text-xs text-slate-300 mt-1.5 flex items-center gap-1">
                          <Star size={10} className="fill-slate-300 text-slate-300" /> tap to reveal
                        </p>
                      </div>
                    </div>
                    {/* Back */}
                    <div
                      className="absolute inset-0 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl shadow-md p-5 flex flex-col justify-between text-white"
                      style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                    >
                      <p className="font-bold text-base leading-snug">{v.meaning}</p>
                      <p className="text-white/80 text-sm italic">"{v.example}"</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── QUIZ ─────────────────────────────────────────────────── */}
        {page === 'quiz' && (
          <div className="space-y-6 max-w-2xl mx-auto animate-fadeInUp">
            <div>
              <h1 className="font-display text-2xl font-bold text-slate-900">Quick Quiz</h1>
              <p className="text-slate-500 text-sm mt-0.5">Test your English knowledge</p>
            </div>

            {quizDone ? (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-10 text-center">
                <div className={`w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center ${quizScore >= 4 ? 'bg-emerald-100' : quizScore >= 2 ? 'bg-amber-100' : 'bg-red-100'}`}>
                  <Award size={36} className={quizScore >= 4 ? 'text-emerald-600' : quizScore >= 2 ? 'text-amber-600' : 'text-red-500'} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-1">Quiz Complete!</h2>
                <div className="text-5xl font-black text-blue-600 my-3">{quizScore}/{QUIZ.length}</div>
                <p className="text-slate-400 text-sm mb-8">
                  {quizScore === QUIZ.length ? 'Perfect! Excellent work!' : quizScore >= 3 ? 'Great job!' : 'Keep practicing!'}
                </p>
                <button onClick={resetQuiz} className="flex items-center gap-2 mx-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors">
                  <RotateCcw size={16} /> Try Again
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="h-1.5 bg-slate-100">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300" style={{ width: `${(quizIdx / QUIZ.length) * 100}%` }} />
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-center mb-5">
                    <span className="text-sm font-medium text-slate-400">Question {quizIdx + 1} / {QUIZ.length}</span>
                    <span className="text-sm font-bold text-blue-600">{quizScore} pts</span>
                  </div>
                  <h2 className="text-lg font-semibold text-slate-900 mb-5">{QUIZ[quizIdx].q}</h2>
                  <div className="space-y-3">
                    {QUIZ[quizIdx].options.map((opt, i) => {
                      let cls = 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50';
                      if (selected !== null) {
                        if (i === QUIZ[quizIdx].answer) cls = 'border-emerald-500 bg-emerald-50 text-emerald-800';
                        else if (i === selected) cls = 'border-red-400 bg-red-50 text-red-700';
                        else cls = 'border-slate-100 bg-slate-50 text-slate-400';
                      }
                      return (
                        <button key={i} onClick={() => handleQuiz(i)} disabled={selected !== null}
                          className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${cls}`}>
                          <span className="font-bold mr-2 text-slate-400">{String.fromCharCode(65 + i)}.</span>{opt}
                        </button>
                      );
                    })}
                  </div>
                  {showExp && (
                    <div className={`mt-4 p-4 rounded-xl text-sm ${selected === QUIZ[quizIdx].answer ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'}`}>
                      <p className="font-semibold mb-0.5">{selected === QUIZ[quizIdx].answer ? 'Correct!' : 'Not quite'}</p>
                      <p>{QUIZ[quizIdx].explanation}</p>
                    </div>
                  )}
                  {selected !== null && (
                    <button onClick={nextQ} className="mt-4 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
                      {quizIdx + 1 >= QUIZ.length ? 'See Results' : 'Next Question'} <ChevronRight size={16} />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </SidebarLayout>
  );
}
