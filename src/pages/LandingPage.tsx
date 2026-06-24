import { BookOpen, Star, Zap, Award, TrendingUp, ArrowRight, Globe, Users, CheckCircle, Play, ChevronDown } from 'lucide-react';
import Navbar from '../components/Navbar';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

const levels = [
  { icon: Star,        key: 'elementary',         label: 'Elementary',         color: 'from-emerald-400 to-teal-500',     desc: 'Basic vocabulary & simple sentences for absolute beginners.' },
  { icon: BookOpen,    key: 'pre-intermediate',   label: 'Pre-Intermediate',   color: 'from-blue-400 to-blue-600',        desc: 'Everyday conversations and foundational grammar.' },
  { icon: Zap,         key: 'intermediate',       label: 'Intermediate',       color: 'from-violet-400 to-purple-600',    desc: 'Complex sentences, tenses, and wider vocabulary.' },
  { icon: TrendingUp,  key: 'upper-intermediate', label: 'Upper-Intermediate', color: 'from-amber-400 to-orange-500',     desc: 'Idioms, nuance, and advanced grammar structures.' },
  { icon: Award,       key: 'advanced',           label: 'Advanced',           color: 'from-rose-400 to-red-600',         desc: 'Native-like fluency, academic writing, and debate.' },
];

const stats = [
  { value: '50K+',  label: 'Active Learners' },
  { value: '500+',  label: 'Lessons' },
  { value: '95%',   label: 'Success Rate' },
  { value: '4.9★',  label: 'Average Rating' },
];

const features = [
  { icon: BookOpen, title: 'Structured Curriculum',  desc: 'Five carefully designed levels guiding you from zero to fluency with a clear path.',  color: 'text-blue-600 bg-blue-50' },
  { icon: Zap,      title: 'Interactive Quizzes',    desc: 'Reinforce what you learn with smart quizzes that adapt to your skill level.',           color: 'text-violet-600 bg-violet-50' },
  { icon: Users,    title: 'Expert Teachers',        desc: 'Lessons crafted by certified English teachers with years of experience.',               color: 'text-emerald-600 bg-emerald-50' },
  { icon: Award,    title: 'Progress Tracking',      desc: "Visual dashboards show exactly how far you've come and what to tackle next.",          color: 'text-amber-600 bg-amber-50' },
  { icon: Globe,    title: 'Real-World English',     desc: 'Dialogues and examples drawn from everyday life, news, and professional settings.',     color: 'text-cyan-600 bg-cyan-50' },
  { icon: CheckCircle, title: 'Certificates',        desc: 'Earn verifiable certificates for each level to share on your CV or LinkedIn.',          color: 'text-rose-600 bg-rose-50' },
];

const testimonials = [
  { name: 'Amina Hassan',  role: 'Medical Student',    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?w=80&h=80&fit=crop',  text: 'LingoRise transformed my English in 3 months. The structured levels made it so easy to track progress.', rating: 5 },
  { name: 'Omar Farah',    role: 'Software Engineer',  avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?w=80&h=80&fit=crop',   text: 'I went from barely speaking to writing professional emails. The advanced course is outstanding.', rating: 5 },
  { name: 'Faadumo Warsame', role: 'Business Owner',  avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?w=80&h=80&fit=crop', text: 'The teacher dashboard is incredible. I can manage my students and track every learner\'s progress.', rating: 5 },
];

export default function LandingPage({ onGetStarted, onLogin }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Navbar transparent onLogin={onLogin} onGetStarted={onGetStarted} />

      {/* Hero */}
      <section className="hero-bg relative min-h-screen flex flex-col items-center justify-center text-center px-4 pt-16 pb-20 overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-dark text-white/90 text-sm font-medium mb-8 animate-fadeInUp">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            #1 English Learning Platform in East Africa
          </div>

          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-black text-white leading-[1.05] mb-6 animate-fadeInUp delay-100">
            Master English.<br />
            <span className="shimmer-text">Change Your Life.</span>
          </h1>

          <p className="text-white/70 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed animate-fadeInUp delay-200">
            From elementary basics to advanced fluency — structured lessons, expert teachers,
            and interactive quizzes all in one beautiful platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fadeInUp delay-300">
            <button
              onClick={onGetStarted}
              className="group px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg rounded-2xl shadow-2xl shadow-blue-500/40 transition-all hover:-translate-y-1 hover:shadow-blue-500/60 flex items-center justify-center gap-2"
            >
              Start Learning Free
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={onLogin}
              className="px-8 py-4 glass-dark text-white font-semibold text-lg rounded-2xl border border-white/20 hover:bg-white/10 transition-all hover:-translate-y-1 flex items-center gap-2"
            >
              <Play size={18} className="fill-white" />
              Watch Demo
            </button>
          </div>

          {/* Stats row */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 animate-fadeInUp delay-400">
            {stats.map(s => (
              <div key={s.value} className="glass-dark rounded-2xl px-4 py-4">
                <div className="text-2xl font-black text-white">{s.value}</div>
                <div className="text-white/60 text-sm mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce opacity-60">
          <ChevronDown size={28} className="text-white" />
        </div>
      </section>

      {/* Levels Section */}
      <section id="levels" className="py-24 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-blue-600 font-semibold text-sm uppercase tracking-widest mb-3">Curriculum</p>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
              Five Levels to Fluency
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">
              Every level builds on the last — start wherever you are, finish wherever you dream.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {levels.map((level, i) => (
              <div
                key={level.key}
                className="card-lift bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 cursor-pointer animate-fadeInUp"
                style={{ animationDelay: `${i * 0.08}s` }}
                onClick={onGetStarted}
              >
                <div className={`h-2 bg-gradient-to-r ${level.color}`} />
                <div className="p-6">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${level.color} flex items-center justify-center mb-4 shadow-lg`}>
                    <level.icon size={22} className="text-white" strokeWidth={2} />
                  </div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Level {i + 1}</div>
                  <h3 className="font-bold text-slate-900 text-lg mb-2">{level.label}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{level.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="courses" className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-blue-600 font-semibold text-sm uppercase tracking-widest mb-3">Features</p>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">
              LingoRise brings together all the tools modern learners and teachers need.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="group p-7 rounded-3xl border border-slate-100 bg-white hover:border-blue-100 hover:bg-blue-50/30 transition-all card-lift animate-fadeInUp"
                style={{ animationDelay: `${i * 0.07}s` }}
              >
                <div className={`w-12 h-12 rounded-2xl ${f.color} flex items-center justify-center mb-5`}>
                  <f.icon size={22} strokeWidth={2} />
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-2">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-blue-600 font-semibold text-sm uppercase tracking-widest mb-3">Testimonials</p>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
              Loved by Thousands
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div
                key={t.name}
                className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 card-lift animate-fadeInUp"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="flex gap-0.5 mb-5">
                  {Array(t.rating).fill(0).map((_, j) => (
                    <Star key={j} size={16} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-700 text-sm leading-relaxed mb-6 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <img src={t.avatar} alt={t.name} className="w-11 h-11 rounded-full object-cover ring-2 ring-blue-100" />
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{t.name}</p>
                    <p className="text-slate-400 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section id="about" className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="hero-bg rounded-3xl p-10 sm:p-16 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-blue-700/30 blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <h2 className="font-display text-4xl sm:text-5xl font-black text-white mb-4">
                Ready to Speak English<br />with Confidence?
              </h2>
              <p className="text-white/70 text-lg mb-10 max-w-xl mx-auto">
                Join over 50,000 learners already transforming their future with LingoRise.
                It's free to start.
              </p>
              <button
                onClick={onGetStarted}
                className="group px-10 py-4 bg-white text-blue-700 font-bold text-lg rounded-2xl hover:bg-blue-50 transition-all shadow-2xl hover:-translate-y-1 flex items-center gap-2 mx-auto"
              >
                Start Your Journey
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
              <BookOpen size={18} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-xl">Lingo<span className="text-blue-400">Rise</span></span>
          </div>
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} LingoRise. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-slate-400">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
