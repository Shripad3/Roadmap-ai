import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Auth from './components/Auth';
import Navbar from './components/Navbar';
import Tasks from './pages/Tasks';
import AIBreakdown from './pages/AIBreakdown';
import Settings from './pages/Settings';

function AppContent() {
  const { user, loading: authLoading, signOut } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <Navbar user={user} onSignOut={signOut} />
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
          <Routes>
            <Route path="/" element={<Tasks />} />
            <Route path="/ai-breakdown" element={<AIBreakdown />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <footer className="bg-white border-t border-gray-200 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-gray-600 text-sm">
            Powered by Gemini AI • Built with React & Express
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}