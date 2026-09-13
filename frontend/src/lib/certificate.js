import { hexToRgba } from './utils';
import {
  buildFieldFont,
  applyTextTransform,
  getEffectiveField,
} from './typography';

export function drawFieldOnCtx(c, field, value, x, y, fontOverride) {
  const displayValue = applyTextTransform(value, field.textTransform || 'none');
  c.font = fontOverride || buildFieldFont(field);
  c.fillStyle = field.color;
  c.textAlign = field.align;
  c.textBaseline = 'middle';

  if (field.shadowEnabled) {
    c.shadowColor = hexToRgba(field.shadowColor, field.shadowOpacity);
    c.shadowBlur = field.shadowBlur;
    c.shadowOffsetX = field.shadowOffsetX;
    c.shadowOffsetY = field.shadowOffsetY;
  } else {
    c.shadowColor = 'transparent';
    c.shadowBlur = 0;
    c.shadowOffsetX = 0;
    c.shadowOffsetY = 0;
  }

  c.fillText(displayValue, x, y);

  // Draw underline if enabled
  if (field.underline) {
    const tw = c.measureText(displayValue).width;
    const th = field.size;
    let ux1, ux2;
    if (field.align === 'center') { ux1 = x - tw / 2; ux2 = x + tw / 2; }
    else if (field.align === 'left') { ux1 = x; ux2 = x + tw; }
    else { ux1 = x - tw; ux2 = x; }
    c.beginPath();
    c.strokeStyle = field.color;
    c.lineWidth = Math.max(1, field.size / 18);
    c.moveTo(ux1, y + th * 0.45);
    c.lineTo(ux2, y + th * 0.45);
    c.stroke();
  }

  c.shadowColor = 'transparent';
  c.shadowBlur = 0;
  c.shadowOffsetX = 0;
  c.shadowOffsetY = 0;
}

// Renders all fields for a single row onto an offscreen canvas at full
// resolution and returns a PNG blob. Pass the real row index so per-row
// overrides are applied.
export function generateCertBlob(image, fields, rowData, rowIdx, rowOverrides) {
  return new Promise((resolve) => {
    const w = image.naturalWidth;
    const h = image.naturalHeight;
    const off = document.createElement('canvas');
    off.width = w;
    off.height = h;
    const oc = off.getContext('2d');
    oc.drawImage(image, 0, 0, w, h);

    for (const baseField of fields) {
      const value = rowData[baseField.key] || '';
      if (!value) continue;
      const field = getEffectiveField(baseField, rowIdx, rowOverrides);
      drawFieldOnCtx(oc, field, value, field.x * w, field.y * h);
    }

    off.toBlob(resolve, 'image/png');
  });
}

// Hit-test against stored bboxes (with 10px padding).
export function hitTestFields(fields, cx, cy) {
  for (let i = fields.length - 1; i >= 0; i--) {
    const b = fields[i]._bbox;
    if (!b) continue;
    const pad = 10;
    if (cx >= b.x1 - pad && cx <= b.x2 + pad && cy >= b.y1 - pad && cy <= b.y2 + pad) {
      return i;
    }
  }
  return -1;
}
