// Loads a certificate file (image or PDF) into an HTMLImageElement
// that the canvas renderer can draw. PDFs are rasterized to a canvas
// first, then converted to an image.
//
// Returns a Promise<{ image: HTMLImageElement, width: number, height: number }>.

const PDFJS_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.8.69/pdf.min.mjs';

let pdfjsPromise = null;

async function loadPdfjs() {
  if (pdfjsPromise) return pdfjsPromise;
  pdfjsPromise = (async () => {
    try {
      // Prefer the bundled npm package when available.
      const mod = await import('pdfjs-dist');
      mod.GlobalWorkerOptions.workerSrc = (
        await import('pdfjs-dist/build/pdf.worker.mjs?url')
      ).default;
      return mod;
    } catch {
      // Fallback to CDN (e.g. if the worker build isn't resolvable).
      const mod = await import(/* @vite-ignore */ PDFJS_CDN);
      mod.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.8.69/pdf.worker.min.mjs';
      return mod;
    }
  })();
  return pdfjsPromise;
}

function imageFromUrl(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ image: img, width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not load image file'));
    };
    img.src = url;
  });
}

async function imageFromPdf(file, scale = 2) {
  const pdfjs = await loadPdfjs();
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: buffer }).promise;
  const page = await pdf.getPage(1);

  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  const ctx = canvas.getContext('2d');

  await page.render({ canvasContext: ctx, viewport }).promise;

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error('Failed to render PDF page'));
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({ image: img, width: img.naturalWidth, height: img.naturalHeight });
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Could not load rendered PDF'));
      };
      img.src = url;
    }, 'image/png');
  });
}

export async function loadCertificateFile(file) {
  if (!file) throw new Error('No file provided');

  if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
    return imageFromPdf(file);
  }

  if (file.type.startsWith('image/')) {
    const url = URL.createObjectURL(file);
    return imageFromUrl(url);
  }

  throw new Error('Unsupported file type - use PNG, JPG, WebP, or PDF');
}
