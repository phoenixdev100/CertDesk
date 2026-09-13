import { FONTS } from './fonts';

export const TYPO_KEYS = [
  'font', 'size', 'color', 'bold', 'italic', 'underline', 'align', 'textTransform',
  'shadowEnabled', 'shadowColor', 'shadowBlur', 'shadowOffsetX', 'shadowOffsetY', 'shadowOpacity',
];

export function defaultTypography() {
  return {
    font:          FONTS[0].value,
    size:          72,
    color:         '#2c1a0e',
    bold:          false,
    italic:        false,
    underline:     false,
    align:         'center',
    textTransform: 'none',
    shadowEnabled: false,
    shadowColor:   '#000000',
    shadowBlur:    6,
    shadowOffsetX: 2,
    shadowOffsetY: 3,
    shadowOpacity: 60,
  };
}

export function pickTypography(obj) {
  const out = {};
  for (const k of TYPO_KEYS) out[k] = obj[k];
  return out;
}

export function getEffectiveField(baseField, rowIdx, rowOverrides) {
  const override = rowIdx >= 0 ? rowOverrides[rowIdx]?.[baseField.key] : null;
  return override ? { ...baseField, ...override } : baseField;
}

export function hasRowOverrides(rowOverrides, rowIdx) {
  const o = rowOverrides[rowIdx];
  return !!o && Object.keys(o).length > 0;
}

export function buildFieldFont(field, overrideFont) {
  const parts = [];
  if (field.italic) parts.push('italic');
  if (field.bold) parts.push('bold');
  parts.push(`${field.size}px`);
  parts.push(overrideFont || field.font);
  return parts.join(' ');
}

export function applyTextTransform(value, transform) {
  if (transform === 'uppercase') return String(value).toUpperCase();
  if (transform === 'titlecase') {
    const s = String(value);
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  }
  return String(value);
}
