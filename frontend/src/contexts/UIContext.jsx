import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import * as api from '../services/api';

const UIContext = createContext(null);

export function UIProvider({ children }) {
  const [isQuickCaptureOpen, setIsQuickCaptureOpen] = useState(false);
  const [quickCaptureCallback, setQuickCaptureCallback] = useState(null);

  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isShortcutHelpOpen, setIsShortcutHelpOpen] = useState(false);

  const [toasts, setToasts] = useState([]);

  const [tasks, setTasks] = useState([]);

  const reloadTasks = useCallback(async () => {
    try {
      const data = await api.getTasks();
      setTasks(data);
    } catch {
      // silent fail — pages manage their own task state
    }
  }, []);

  useEffect(() => {
    reloadTasks();
  }, [reloadTasks]);

  const openQuickCapture = useCallback((onCreated) => {
    setQuickCaptureCallback(() => onCreated ?? null);
    setIsQuickCaptureOpen(true);
  }, []);

  const closeQuickCapture = useCallback(() => {
    setIsQuickCaptureOpen(false);
    setQuickCaptureCallback(null);
  }, []);

  const openCommandPalette = useCallback(() => setIsCommandPaletteOpen(true), []);
  const closeCommandPalette = useCallback(() => setIsCommandPaletteOpen(false), []);

  const openShortcutHelp = useCallback(() => setIsShortcutHelpOpen(true), []);
  const closeShortcutHelp = useCallback(() => setIsShortcutHelpOpen(false), []);

  const showToast = useCallback((message, type = 'error') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  }, []);

  return (
    <UIContext.Provider
      value={{
        isQuickCaptureOpen,
        openQuickCapture,
        closeQuickCapture,
        quickCaptureCallback,
        isCommandPaletteOpen,
        openCommandPalette,
        closeCommandPalette,
        isShortcutHelpOpen,
        openShortcutHelp,
        closeShortcutHelp,
        toasts,
        showToast,
        tasks,
        setTasks,
        reloadTasks,
      }}
    >
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI must be used within UIProvider');
  return ctx;
}
