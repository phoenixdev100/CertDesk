import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, icon, children, footer, wide = false }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-ink/30 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div
        className={`flex max-h-[90vh] flex-col rounded-lg border border-line bg-surface shadow-modal ${
          wide ? 'w-[680px]' : 'w-[420px]'
        }`}
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-ink">
            {icon}
            {title}
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-ink-faint hover:bg-surface-subtle hover:text-ink"
            aria-label="Close"
          >
            <X size={15} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-line px-4 py-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
