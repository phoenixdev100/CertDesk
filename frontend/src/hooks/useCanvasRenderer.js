import { useEffect } from 'react';
import { useCertStore } from '../store/useCertStore';
import { drawFieldOnCtx } from '../lib/certificate';
import { setBboxes } from '../lib/bboxes';
import {
  buildFieldFont,
  applyTextTransform,
  getEffectiveField,
} from '../lib/typography';

// Renders the certificate image + all fields onto the canvas whenever
// relevant store state changes. Bounding boxes are written to a
// non-reactive module so they don't trigger re-renders.
export function useCanvasRenderer(canvasRef) {
  const image = useCertStore((s) => s.image);
  const fields = useCertStore((s) => s.fields);
  const activeFieldIdx = useCertStore((s) => s.activeFieldIdx);
  const hoverFont = useCertStore((s) => s.hoverFont);
  const previewRowIdx = useCertStore((s) => (s.teams.length > 0 ? s.teamPreviewRowIdx : s.previewRowIdx));
  const excelData = useCertStore((s) => s.excelData);
  const teamData = useCertStore((s) => s.teamData);
  const teams = useCertStore((s) => s.teams);
  const rowOverrides = useCertStore((s) => s.rowOverrides);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;
    const ctx = canvas.getContext('2d');
    const w = image.naturalWidth;
    const h = image.naturalHeight;

    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }

    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(image, 0, 0, w, h);

    const activeData = teams.length > 0 ? teamData : excelData;
    const previewRow = activeData[previewRowIdx] || null;
    const bboxes = [];

    for (let i = 0; i < fields.length; i++) {
      const baseField = fields[i];
      const field = getEffectiveField(baseField, previewRowIdx, rowOverrides);
      const value = previewRow ? previewRow[field.key] || field.key : field.key;
      const x = field.x * w;
      const y = field.y * h;

      const effectiveFont =
        i === activeFieldIdx && hoverFont
          ? buildFieldFont(field, hoverFont)
          : buildFieldFont(field);

      drawFieldOnCtx(ctx, field, value, x, y, effectiveFont);

      ctx.font = effectiveFont;
      const tw = ctx.measureText(applyTextTransform(value, field.textTransform || 'none')).width;
      const th = field.size * 1.4;
      let x1, x2;
      if (field.align === 'center') { x1 = x - tw / 2; x2 = x + tw / 2; }
      else if (field.align === 'left') { x1 = x; x2 = x + tw; }
      else { x1 = x - tw; x2 = x; }
      bboxes[i] = { x1, y1: y - th / 2, x2, y2: y + th / 2 };
    }

    setBboxes(bboxes);
  }, [image, fields, activeFieldIdx, hoverFont, previewRowIdx, excelData, teamData, teams, rowOverrides, canvasRef]);
}
