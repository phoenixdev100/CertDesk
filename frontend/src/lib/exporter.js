// Export utilities for certificates in multiple formats.

import { drawFieldOnCtx } from './certificate';
import { getEffectiveField } from './typography';

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

  for (const baseField of fields) {
    const value = rowData[baseField.key] || '';
    if (!value) continue;
    const field = getEffectiveField(baseField, rowIdx, rowOverrides);
    drawFieldOnCtx(ctx, field, value, field.x * w, field.y * h);
  }

  return canvas;
}

// Convert a rendered canvas to the chosen format blob.
async function canvasToBlob(canvas, format) {
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
  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, mime, format === 'jpeg' ? 0.92 : undefined)
  );
  return { blob, ext };
}

// Export a single certificate in the chosen format.
export async function exportCertificate(image, fields, rowData, rowIdx, rowOverrides, format) {
  const canvas = await renderToCanvas(image, fields, rowData, rowIdx, rowOverrides);
  return canvasToBlob(canvas, format);
}

// Export all certificates as a ZIP in the chosen format.
// Processes certificates in parallel batches of 8 for speed.
// Progress updates after each batch so the bar still advances incrementally.
export async function exportCertificatesZip(image, fields, excelData, rowOverrides, format, onProgress, signal) {
  const { default: JSZip } = await import('jszip');
  const zip = new JSZip();
  const usedNames = new Set();
  const total = excelData.length;

  // Pre-load jsPDF once for PDF bulk exports
  if (format === 'pdf') {
    await import('jspdf');
  }

  if (signal?.aborted) {
    throw new Error('Export cancelled');
  }

  if (onProgress) onProgress(0);

  const BATCH = 8;
  let done = 0;

  for (let i = 0; i < total; i += BATCH) {
    if (signal?.aborted) {
      throw new Error('Export cancelled');
    }

    const slice = excelData.slice(i, i + BATCH);
    const results = await Promise.all(
      slice.map(async (row, j) => {
        const rowIdx = i + j;
        const canvas = await renderToCanvas(image, fields, row, rowIdx, rowOverrides);
        const { blob, ext } = await canvasToBlob(canvas, format);
        return { row, blob, ext };
      })
    );

    for (const { row, blob, ext } of results) {
      const label = row.name || `row_${done + 1}`;
      const safeLabel = label.replace(/[^\w\s-]/g, '').replace(/\s+/g, '_').slice(0, 60) || 'certificate';

      let fileName = `${safeLabel}_certificate.${ext}`;
      if (usedNames.has(fileName)) {
        let counter = 2;
        while (usedNames.has(`${safeLabel}_certificate_${counter}.${ext}`)) {
          counter++;
        }
        fileName = `${safeLabel}_certificate_${counter}.${ext}`;
      }
      usedNames.add(fileName);
      zip.file(fileName, blob);
      done++;
    }

    if (onProgress) onProgress(Math.round((done / total) * 100));

    // Yield to the UI so the progress bar can paint
    if (i + BATCH < total) {
      await new Promise((r) => setTimeout(r, 0));
    }
  }

  return zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
}
