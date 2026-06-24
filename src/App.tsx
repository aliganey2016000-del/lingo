import { useState } from 'react';
import { AuthProvider } from './lib/AuthContext';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminDashboard from './pages/AdminDashboard';
import CoursePreviewPage from './pages/CoursePreviewPage';
import { useAuth } from './lib/AuthContext';

function AppRouter() {
  const { user, profile, loading } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [previewCourseId, setPreviewCourseId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen hero-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/70 text-lg font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (previewCourseId) {
    return (
      <CoursePreviewPage
        courseId={previewCourseId}
        onBack={() => setPreviewCourseId(null)}
      />
    );
  }

  if (user && profile) {
    if (profile.role === 'admin') return <AdminDashboard onPreviewCourse={setPreviewCourseId} />;
    if (profile.role === 'teacher') return <TeacherDashboard />;
    return <StudentDashboard />;
  }

  if (showAuth) {
    return (
      <AuthPage
        mode={authMode}
        setMode={setAuthMode}
        onBack={() => setShowAuth(false)}
      />
    );
  }

  return (
    <LandingPage
      onGetStarted={() => { setAuthMode('signup'); setShowAuth(true); }}
      onLogin={() => { setAuthMode('login'); setShowAuth(true); }}
    />
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}
