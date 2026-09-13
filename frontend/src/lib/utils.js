export function hexToRgba(hex, opacity) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${opacity / 100})`;
}

const AMP = String.fromCharCode(38) + 'amp;';
const LT = String.fromCharCode(38) + 'lt;';
const GT = String.fromCharCode(38) + 'gt;';

export function esc(str) {
  return String(str)
    .replace(/&/g, AMP)
    .replace(/</g, LT)
    .replace(/>/g, GT);
}

export function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function safeName(n) {
  return (
    String(n)
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '_')
      .slice(0, 60) || 'certificate'
  );
}

export function blobToBase64(blob) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(',')[1]);
    reader.readAsDataURL(blob);
  });
}

export function triggerDownload(blob, filename) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 3000);
}

export function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}
