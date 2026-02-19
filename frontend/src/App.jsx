import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Auth from './components/Auth';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Tasks from './pages/Tasks';
import AIBreakdown from './pages/AIBreakdown';
import Settings from './pages/Settings';

function AppShell({ user, signOut, children }) {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <Navbar user={user} onSignOut={signOut} />
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">{children}</main>

      <footer className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-gray-600 text-sm">
          Powered by Gemini AI • Built with React & Express
        </div>
      </footer>
    </div>
  );
}

function AppRoutes() {
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

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/tasks" replace /> : <Landing />} />
      <Route path="/auth" element={user ? <Navigate to="/tasks" replace /> : <Auth />} />
      <Route
        path="/tasks"
        element={
          user ? (
            <AppShell user={user} signOut={signOut}>
              <Tasks />
            </AppShell>
          ) : (
            <Navigate to="/auth" replace />
          )
        }
      />
      <Route
        path="/ai-breakdown"
        element={
          user ? (
            <AppShell user={user} signOut={signOut}>
              <AIBreakdown />
            </AppShell>
          ) : (
            <Navigate to="/auth" replace />
          )
        }
      />
      <Route
        path="/settings"
        element={
          user ? (
            <AppShell user={user} signOut={signOut}>
              <Settings />
            </AppShell>
          ) : (
            <Navigate to="/auth" replace />
          )
        }
      />
      <Route path="*" element={<Navigate to={user ? '/tasks' : '/'} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
