import { useRef, useEffect } from 'react';
import { useCertStore } from '../../store/useCertStore';
import { useCanvasRenderer } from '../../hooks/useCanvasRenderer';
import { useFieldDrag } from '../../hooks/useFieldDrag';
import { clamp01 } from '../../lib/utils';
import FieldOverlay from './FieldOverlay';

export default function CertificateCanvas() {
  const canvasRef = useRef(null);
  const image = useCertStore((s) => s.image);
  const naturalW = useCertStore((s) => s.naturalW);
  const naturalH = useCertStore((s) => s.naturalH);
  const scale = useCertStore((s) => s.scale);
  const addField = useCertStore((s) => s.addField);
  const excelColumns = useCertStore((s) => s.excelColumns);
  const activeFieldIdx = useCertStore((s) => s.activeFieldIdx);

  useCanvasRenderer(canvasRef);
  const { onPointerDown, onPointerMove, onPointerUp } = useFieldDrag(canvasRef);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !naturalW) return;
    canvas.style.width = Math.round(naturalW * scale) + 'px';
    canvas.style.height = Math.round(naturalH * scale) + 'px';
  }, [naturalW, naturalH, scale]);

  const onDrop = (e) => {
    e.preventDefault();
    const key = e.dataTransfer.getData('text/plain');
    if (!key || !excelColumns.includes(key)) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = clamp01((e.clientX - rect.left) / rect.width);
    const y = clamp01((e.clientY - rect.top) / rect.height);
    addField(key, x, y);
  };

  return (
    <div className="relative inline-block select-none">
      <canvas
        ref={canvasRef}
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        onMouseDown={onPointerDown}
        onMouseMove={onPointerMove}
        onMouseUp={onPointerUp}
        onTouchStart={onPointerDown}
        onTouchMove={onPointerMove}
        onTouchEnd={onPointerUp}
        className="max-w-full cursor-crosshair rounded-md border border-line bg-surface shadow-card"
      />
      {activeFieldIdx >= 0 && <FieldOverlay canvasRef={canvasRef} />}
    </div>
  );
}
