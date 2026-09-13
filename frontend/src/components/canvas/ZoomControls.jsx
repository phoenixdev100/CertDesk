import { Minus, Plus } from 'lucide-react';
import { useCertStore } from '../../store/useCertStore';
import { ZOOM_STEPS } from '../../constants';

export default function ZoomControls() {
  const zoomIdx = useCertStore((s) => s.zoomIdx);
  const setZoom = useCertStore((s) => s.setZoom);

  const change = (delta) => {
    const next = Math.max(0, Math.min(ZOOM_STEPS.length - 1, zoomIdx + delta));
    setZoom(next, ZOOM_STEPS[next]);
  };

  return (
    <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-md border border-line bg-surface shadow-card">
      <button onClick={() => change(-1)} className="px-2 py-1 text-ink-muted hover:bg-surface-subtle" disabled={zoomIdx === 0}>
        <Minus size={13} />
      </button>
      <span className="px-2 text-2xs font-medium text-ink-muted">{Math.round(ZOOM_STEPS[zoomIdx] * 100)}%</span>
      <button onClick={() => change(1)} className="px-2 py-1 text-ink-muted hover:bg-surface-subtle" disabled={zoomIdx === ZOOM_STEPS.length - 1}>
        <Plus size={13} />
      </button>
    </div>
  );
}
