import { useCallback } from 'react';
import { useCertStore } from '../store/useCertStore';
import { clamp01 } from '../lib/utils';
import { hitTest } from '../lib/bboxes';
import { getEffectiveField } from '../lib/typography';

// Mouse + touch drag-to-reposition logic for placed fields.
export function useFieldDrag(canvasRef) {
  const selectField = useCertStore((s) => s.selectField);
  const updateActiveFieldPosition = useCertStore((s) => s.updateActiveFieldPosition);
  const overrideActiveFieldPosition = useCertStore((s) => s.overrideActiveFieldPosition);

  const canvasCoords = useCallback((e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) / rect.width,
      y: (clientY - rect.top) / rect.height,
    };
  }, [canvasRef]);

  const onPointerDown = useCallback((e) => {
    if (e.button !== undefined && e.button !== 0) return;
    e.stopPropagation();
    const c = canvasCoords(e);
    const s = useCertStore.getState();
    const cx = c.x * s.naturalW;
    const cy = c.y * s.naturalH;
    const hitIdx = hitTest(cx, cy);

    if (hitIdx >= 0) {
      selectField(hitIdx);
      const baseField = s.fields[hitIdx];
      const f = getEffectiveField(baseField, s.previewRowIdx, s.rowOverrides);
      dragState.active = true;
      dragState.offX = c.x - f.x;
      dragState.offY = c.y - f.y;
      canvasRef.current.style.cursor = 'grabbing';
    } else {
      selectField(-1);
    }
    e.preventDefault();
  }, [canvasCoords, selectField, canvasRef]);

  const onPointerMove = useCallback((e) => {
    if (!dragState.active) return;
    const s = useCertStore.getState();
    if (s.activeFieldIdx < 0) return;
    const c = canvasCoords(e);
    const newX = clamp01(c.x - dragState.offX);
    const newY = clamp01(c.y - dragState.offY);
    if (s.editingRowIdx >= 0) {
      overrideActiveFieldPosition(newX, newY);
    } else {
      updateActiveFieldPosition(newX, newY);
    }
  }, [canvasCoords, overrideActiveFieldPosition, updateActiveFieldPosition]);

  const onPointerUp = useCallback(() => {
    dragState.active = false;
    if (canvasRef.current) canvasRef.current.style.cursor = 'crosshair';
  }, [canvasRef]);

  return { onPointerDown, onPointerMove, onPointerUp };
}

const dragState = { active: false, offX: 0, offY: 0 };
