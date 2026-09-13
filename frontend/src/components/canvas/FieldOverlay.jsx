import { useMemo, useCallback } from 'react';
import { X } from 'lucide-react';
import { useCertStore } from '../../store/useCertStore';
import {
  getEffectiveField,
  buildFieldFont,
  applyTextTransform,
} from '../../lib/typography';

// Shared offscreen canvas for text measurement.
let measureCtx = null;
function getMeasureCtx() {
  if (!measureCtx) measureCtx = document.createElement('canvas').getContext('2d');
  return measureCtx;
}

const CORNERS = ['nw', 'sw', 'se'];
const CORNER_STYLE = {
  nw: { left: -4, top: -4, cursor: 'nwse-resize' },
  sw: { left: -4, bottom: -4, cursor: 'nesw-resize' },
  se: { right: -4, bottom: -4, cursor: 'nwse-resize' },
};

export default function FieldOverlay({ canvasRef }) {
  const activeFieldIdx = useCertStore((s) => s.activeFieldIdx);
  const fields = useCertStore((s) => s.fields);
  const scale = useCertStore((s) => s.scale);
  const naturalW = useCertStore((s) => s.naturalW);
  const naturalH = useCertStore((s) => s.naturalH);
  const previewRowIdx = useCertStore((s) => s.previewRowIdx);
  const excelData = useCertStore((s) => s.excelData);
  const rowOverrides = useCertStore((s) => s.rowOverrides);
  const removeField = useCertStore((s) => s.removeField);

  // Compute the active field's bounding box by measuring rendered text.
  const displayBox = useMemo(() => {
    if (activeFieldIdx < 0 || !fields[activeFieldIdx]) return null;
    const baseField = fields[activeFieldIdx];
    const field = getEffectiveField(baseField, previewRowIdx, rowOverrides);
    const previewRow = excelData[previewRowIdx];
    const value = previewRow
      ? previewRow[field.key] || `[${field.key}]`
      : `[${field.key}]`;

    const ctx = getMeasureCtx();
    ctx.font = buildFieldFont(field);
    const tw = ctx.measureText(
      applyTextTransform(value, field.textTransform || 'none'),
    ).width;
    const th = field.size * 1.4;

    const cx = field.x * naturalW;
    const cy = field.y * naturalH;

    let x1, x2;
    if (field.align === 'center') { x1 = cx - tw / 2; x2 = cx + tw / 2; }
    else if (field.align === 'left') { x1 = cx; x2 = cx + tw; }
    else { x1 = cx - tw; x2 = cx; }

    const pad = 4; // breathing room around the text
    return {
      left: (x1 - pad) * scale,
      top: (cy - th / 2 - pad) * scale,
      width: (x2 - x1 + pad * 2) * scale,
      height: (th + pad * 2) * scale,
    };
  }, [activeFieldIdx, fields, previewRowIdx, excelData, rowOverrides, naturalW, naturalH, scale]);

  // Drag a corner handle to scale font size proportionally.
  const onResizeStart = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      const s = useCertStore.getState();
      if (s.activeFieldIdx < 0) return;

      const baseField = s.fields[s.activeFieldIdx];
      const field = getEffectiveField(baseField, s.previewRowIdx, s.rowOverrides);
      const anchorX = field.x * s.naturalW;
      const anchorY = field.y * s.naturalH;

      const rect = canvasRef.current.getBoundingClientRect();
      const toNatural = (clientX, clientY) => ({
        x: ((clientX - rect.left) / rect.width) * s.naturalW,
        y: ((clientY - rect.top) / rect.height) * s.naturalH,
      });

      const init = toNatural(
        e.touches ? e.touches[0].clientX : e.clientX,
        e.touches ? e.touches[0].clientY : e.clientY,
      );
      const initDist = Math.max(1, Math.hypot(init.x - anchorX, init.y - anchorY));
      const initSize = field.size;

      const onMove = (ev) => {
        const pt = toNatural(
          ev.touches ? ev.touches[0].clientX : ev.clientX,
          ev.touches ? ev.touches[0].clientY : ev.clientY,
        );
        const dist = Math.hypot(pt.x - anchorX, pt.y - anchorY);
        const newSize = Math.max(10, Math.min(300, Math.round(initSize * (dist / initDist))));
        const st = useCertStore.getState();
        if (st.editingRowIdx >= 0) st.overrideActiveFieldTypography({ size: newSize });
        else st.updateActiveFieldTypography({ size: newSize });
      };

      const onUp = () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        document.removeEventListener('touchmove', onMove);
        document.removeEventListener('touchend', onUp);
      };

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
      document.addEventListener('touchmove', onMove, { passive: false });
      document.addEventListener('touchend', onUp);
    },
    [canvasRef],
  );

  if (!displayBox) return null;

  return (
    <div
      className="pointer-events-none absolute rounded-sm"
      style={{
        left: displayBox.left,
        top: displayBox.top,
        width: displayBox.width,
        height: displayBox.height,
      }}
    >
      {/* Selection border - single dashed outline, no overlap */}
      <div className="absolute inset-0 rounded-sm border border-brand-500 border-dashed" />

      {/* Remove button - top-right, slightly outside the box */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          removeField(activeFieldIdx);
        }}
        onMouseDown={(e) => e.stopPropagation()}
        className="pointer-events-auto absolute -right-2.5 -top-2.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-500 text-white shadow-sm hover:bg-red-800"
        title="Remove field"
        style={{ width: 18, height: 18 }}
      >
        <X size={10} />
      </button>

      {/* Corner resize handles */}
      {CORNERS.map((corner) => {
        const pos = CORNER_STYLE[corner];
        return (
          <div
            key={corner}
            onMouseDown={(e) => onResizeStart(e)}
            onTouchStart={(e) => onResizeStart(e)}
            className="pointer-events-auto absolute h-2 w-2 rounded-sm border border-brand-500 bg-white shadow-sm hover:bg-brand-100"
            style={{ cursor: pos.cursor, ...pos }}
            title="Drag to resize"
          />
        );
      })}
    </div>
  );
}
