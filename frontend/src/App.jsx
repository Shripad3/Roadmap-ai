import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { UIProvider, useUI } from './contexts/UIContext';
import Auth from './components/Auth';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import QuickCaptureModal from './components/QuickCaptureModal';
import CommandPalette from './components/CommandPalette';
import KeyboardShortcutHelp from './components/KeyboardShortcutHelp';
import Toast from './components/Toast';
import Landing from './pages/Landing';
import Today from './pages/Today';
import Tasks from './pages/Tasks';
import AIBreakdown from './pages/AIBreakdown';
import Settings from './pages/Settings';
import Dashboard from './pages/Dashboard';
import SharedTaskView from './pages/SharedTaskView';

function AppShell({ user, signOut, children }) {
  const navigate = useNavigate();
  const {
    isQuickCaptureOpen, openQuickCapture, closeQuickCapture,
    isCommandPaletteOpen, openCommandPalette, closeCommandPalette,
    isShortcutHelpOpen, openShortcutHelp, closeShortcutHelp,
    toasts,
    tasks,
  } = useUI();

  // Global keyboard listeners
  useEffect(() => {
    let lastKey = null;
    let lastKeyTime = 0;

    function handler(e) {
      // Cmd+K → command palette (any context)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        openCommandPalette();
        return;
      }

      // ⌘+N and ⌘+? are handled with metaKey — allow those through
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        openQuickCapture();
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '?') {
        e.preventDefault();
        openShortcutHelp();
        return;
      }

      // Skip shortcuts when typing in form elements or when a modal is open
      const tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (isQuickCaptureOpen || isCommandPaletteOpen || isShortcutHelpOpen) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const now = Date.now();
      const key = e.key.toLowerCase();

      // Two-key sequences: g+t, g+a, g+d
      if (lastKey === 'g' && now - lastKeyTime < 800) {
        if (key === 't') { e.preventDefault(); navigate('/today'); }
        else if (key === 'a') { e.preventDefault(); navigate('/tasks'); }
        else if (key === 'd') { e.preventDefault(); navigate('/dashboard'); }
        lastKey = null;
        return;
      }

      if (key === 'g') { lastKey = 'g'; lastKeyTime = now; return; }

      lastKey = key;
      lastKeyTime = now;
    }

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isQuickCaptureOpen, isCommandPaletteOpen, isShortcutHelpOpen, navigate, openCommandPalette, openQuickCapture, openShortcutHelp]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar user={user} onSignOut={signOut} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 pt-4 md:pt-24 pb-24">
        {children}
      </main>
      <BottomNav />

      {isQuickCaptureOpen && <QuickCaptureModal onClose={closeQuickCapture} />}
      {isCommandPaletteOpen && <CommandPalette tasks={tasks} onClose={closeCommandPalette} />}
      {isShortcutHelpOpen && <KeyboardShortcutHelp onClose={closeShortcutHelp} />}
      <Toast toasts={toasts} />
    </div>
  );
}

function AppRoutes() {
  const { user, loading: authLoading, signOut } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
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
          <UIProvider>
            <AppRoutes />
          </UIProvider>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
