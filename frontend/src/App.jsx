import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Auth from './components/Auth';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import Landing from './pages/Landing';
import Today from './pages/Today';
import Tasks from './pages/Tasks';
import AIBreakdown from './pages/AIBreakdown';
import Settings from './pages/Settings';
import Dashboard from './pages/Dashboard';
import SharedTaskView from './pages/SharedTaskView';

function AppShell({ user, signOut, children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onSignOut={signOut} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 pt-4 md:pt-24 pb-24">
        {children}
      </main>
      <BottomNav />
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

  const protect = (element) =>
    user ? <AppShell user={user} signOut={signOut}>{element}</AppShell> : <Navigate to="/auth" replace />;

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/today" replace /> : <Landing />} />
      <Route path="/auth" element={user ? <Navigate to="/today" replace /> : <Auth />} />
      <Route path="/today" element={protect(<Today />)} />
      <Route path="/tasks" element={protect(<Tasks />)} />
      <Route path="/ai-breakdown" element={protect(<AIBreakdown />)} />
      <Route path="/settings" element={protect(<Settings />)} />
      <Route path="/dashboard" element={protect(<Dashboard />)} />
      <Route path="/share/:taskId" element={<SharedTaskView />} />
      <Route path="*" element={<Navigate to={user ? '/today' : '/'} replace />} />
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
