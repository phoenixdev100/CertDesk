// Export utilities for certificates in multiple formats.

const MIME_TYPES = {
  png: 'image/png',
  jpeg: 'image/jpeg',
  pdf: 'application/pdf',
};

const EXTENSIONS = {
  png: 'png',
  jpeg: 'jpg',
  pdf: 'pdf',
};

// Renders a certificate row to a canvas at full resolution.
async function renderToCanvas(image, fields, rowData, rowIdx, rowOverrides) {
  const w = image.naturalWidth;
  const h = image.naturalHeight;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0, w, h);

  // Defer to the shared drawing logic
  const { drawFieldOnCtx } = await import('./certificate');
  const { getEffectiveField } = await import('./typography');

  for (const baseField of fields) {
    const value = rowData[baseField.key] || '';
    if (!value) continue;
    const field = getEffectiveField(baseField, rowIdx, rowOverrides);
    drawFieldOnCtx(ctx, field, value, field.x * w, field.y * h);
  }

  return canvas;
}

// Export a single certificate in the chosen format.
export async function exportCertificate(image, fields, rowData, rowIdx, rowOverrides, format) {
  const canvas = await renderToCanvas(image, fields, rowData, rowIdx, rowOverrides);

  if (format === 'pdf') {
    const { jsPDF } = await import('jspdf');
    const orientation = canvas.width > canvas.height ? 'landscape' : 'portrait';
    const pdf = new jsPDF({
      orientation,
      unit: 'px',
      format: [canvas.width, canvas.height],
      compress: true,
    });
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    return { blob: pdf.output('blob'), ext: 'pdf' };
  }

  const mime = MIME_TYPES[format] || MIME_TYPES.png;
  const ext = EXTENSIONS[format] || 'png';
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, mime, format === 'jpeg' ? 0.92 : undefined));
  return { blob, ext };
}

// Export all certificates as a ZIP in the chosen format.
export async function exportCertificatesZip(image, fields, excelData, rowOverrides, format, onProgress) {
  const { default: JSZip } = await import('jszip');
  const zip = new JSZip();

  for (let i = 0; i < excelData.length; i++) {
    const row = excelData[i];
    const { blob, ext } = await exportCertificate(image, fields, row, i, rowOverrides, format);
    const label = row.name || `row_${i + 1}`;
    const safeLabel = label.replace(/[^\w\s-]/g, '').replace(/\s+/g, '_').slice(0, 60) || 'certificate';
    zip.file(`${safeLabel}_${i + 1}.${ext}`, blob);
    if (onProgress) onProgress(Math.round(((i + 1) / excelData.length) * 100));
    await new Promise((r) => setTimeout(r, 0));
  }

  return zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
}
