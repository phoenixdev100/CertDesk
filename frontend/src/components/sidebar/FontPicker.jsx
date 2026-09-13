import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { FONTS } from '../../lib/fonts';
import { useCertStore } from '../../store/useCertStore';

export default function FontPicker() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef(null);
  const searchRef = useRef(null);
  const committedFont = useCertStore((s) => s.committedFont);
  const setCommittedFont = useCertStore((s) => s.setCommittedFont);
  const setHoverFont = useCertStore((s) => s.setHoverFont);
  const activeFieldIdx = useCertStore((s) => s.activeFieldIdx);
  const updateActiveFieldTypography = useCertStore((s) => s.updateActiveFieldTypography);
  const overrideActiveFieldTypography = useCertStore((s) => s.overrideActiveFieldTypography);
  const editingRowIdx = useCertStore((s) => s.editingRowIdx);

  const currentIdx = FONTS.findIndex((f) => f.value === committedFont);
  const currentLabel = FONTS[currentIdx]?.label || 'Select font';

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (open) {
      setQuery('');
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [open]);

  // Keyboard navigation: arrow up/down, enter to select, escape to close
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') { setOpen(false); return; }
      if (e.key === 'Enter') {
        e.preventDefault();
        if (highlightedIdx >= 0) commit(filtered[highlightedIdx]._origIdx);
        return;
      }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIdx((prev) => {
          const max = filtered.length - 1;
          if (max < 0) return -1;
          if (e.key === 'ArrowDown') return prev < max ? prev + 1 : 0;
          return prev > 0 ? prev - 1 : max;
        });
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, query]);

  const commit = (idx) => {
    const font = FONTS[idx].value;
    setCommittedFont(font);
    setHoverFont(null);
    setOpen(false);
    if (activeFieldIdx >= 0) {
      if (editingRowIdx >= 0) overrideActiveFieldTypography({ font });
      else updateActiveFieldTypography({ font });
    }
  };

  // Filter fonts by search query (matches label or category)
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return FONTS.map((f, i) => ({ ...f, _origIdx: i }));
    return FONTS
      .map((f, i) => ({ ...f, _origIdx: i }))
      .filter((f) => f.label.toLowerCase().includes(q) || f.category.toLowerCase().includes(q));
  }, [query]);

  const [highlightedIdx, setHighlightedIdx] = useState(-1);

  // Reset highlight when filter changes
  useEffect(() => { setHighlightedIdx(filtered.length ? 0 : -1); }, [query]);

  let currentCategory = '';

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="input flex items-center justify-between"
      >
        <span style={{ fontFamily: committedFont }}>{currentLabel}</span>
        <ChevronDown size={12} className={`text-ink-faint transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-md border border-line bg-surface shadow-card">
          {/* Search input */}
          <div className="flex items-center gap-1.5 border-b border-line px-2 py-1.5">
            <Search size={12} className="text-ink-faint" />
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search fonts..."
              className="w-full bg-transparent text-xs text-ink outline-none placeholder:text-ink-faint"
            />
            <span className="text-2xs text-ink-faint">{filtered.length}</span>
          </div>

          {/* Font list */}
          <div className="max-h-56 overflow-auto">
            {filtered.length === 0 && (
              <div className="px-2.5 py-3 text-center text-2xs text-ink-faint">No fonts found</div>
            )}
            {filtered.map((f, displayIdx) => {
              const showCat = !query && f.category !== currentCategory;
              if (showCat) currentCategory = f.category;
              return (
                <div key={f.label}>
                  {showCat && (
                    <div className="sticky top-0 bg-surface-subtle px-2.5 py-1 text-2xs font-semibold uppercase tracking-wide text-ink-faint">
                      {f.category}
                    </div>
                  )}
                  <div
                    onClick={() => commit(f._origIdx)}
                    onMouseEnter={() => {
                      setHoverFont(f.value);
                      setHighlightedIdx(displayIdx);
                      if (activeFieldIdx >= 0) {
                        useCertStore.getState().setHoverFont(f.value);
                      }
                    }}
                    onMouseLeave={() => setHoverFont(null)}
                    className={`cursor-pointer px-2.5 py-1.5 text-xs ${
                      displayIdx === highlightedIdx ? 'bg-brand-50' : ''
                    } ${f._origIdx === currentIdx ? 'text-brand-700' : 'text-ink'} hover:bg-brand-50`}
                    style={{ fontFamily: f.value }}
                  >
                    {f.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
