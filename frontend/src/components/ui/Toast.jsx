import { createContext, useCallback, useContext, useRef, useState } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const timer = useRef(null);

  const show = useCallback((message, type = '') => {
    setToast({ message, type });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 2500);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      {toast && (
        <div
          className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-50 rounded-md px-4 py-2 text-xs font-medium shadow-card border ${
            toast.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : toast.type === 'warning'
                ? 'bg-amber-50 border-amber-200 text-amber-700'
                : 'bg-surface border-line text-ink'
          }`}
        >
          {toast.message}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
