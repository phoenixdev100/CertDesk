// Persists the workspace state across refreshes.
// Small data (fields, excel data, overrides, zoom) goes to localStorage.
// The certificate image (potentially large) goes to IndexedDB.

import { STORAGE_KEYS } from '../constants';

const DB_NAME = 'certdesk';
const DB_VERSION = 1;
const IMAGE_STORE = 'images';
const IMAGE_KEY = 'certificate';

// ── IndexedDB for the image ─────────────────────────────────────────
function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(IMAGE_STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveImage(image) {
  if (!image) return;
  try {
    // Draw image to canvas → data URL (PNG, lossless)
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    canvas.getContext('2d').drawImage(image, 0, 0);
    const dataUrl = canvas.toDataURL('image/png');

    const db = await openDb();
    const tx = db.transaction(IMAGE_STORE, 'readwrite');
    tx.objectStore(IMAGE_STORE).put(dataUrl, IMAGE_KEY);
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Could not persist image:', err);
  }
}

export async function loadImage() {
  try {
    const db = await openDb();
    const tx = db.transaction(IMAGE_STORE, 'readonly');
    const req = tx.objectStore(IMAGE_STORE).get(IMAGE_KEY);
    return new Promise((resolve) => {
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function clearImage() {
  try {
    const db = await openDb();
    const tx = db.transaction(IMAGE_STORE, 'readwrite');
    tx.objectStore(IMAGE_STORE).delete(IMAGE_KEY);
  } catch {}
}

// ── localStorage for the rest ───────────────────────────────────────
const STATE_KEY = 'certdesk_workspace';

export function saveWorkspace(state) {
  try {
    const serializable = {
      fields: state.fields.map(({ _bbox, ...rest }) => rest),
      excelData: state.excelData,
      excelColumns: state.excelColumns,
      rowOverrides: state.rowOverrides,
      zoomIdx: state.zoomIdx,
      activeFieldIdx: state.activeFieldIdx,
      previewRowIdx: state.previewRowIdx,
      teamPreviewRowIdx: state.teamPreviewRowIdx,
      teamMode: state.teamMode,
      teams: state.teams,
      teamKey: state.teamKey,
      teamData: state.teamData,
      teamColumns: state.teamColumns,
    };
    localStorage.setItem(STATE_KEY, JSON.stringify(serializable));
  } catch (err) {
    console.warn('Could not persist workspace:', err);
  }
}

export function loadWorkspace() {
  try {
    return JSON.parse(localStorage.getItem(STATE_KEY) || 'null');
  } catch {
    return null;
  }
}

export function clearWorkspace() {
  localStorage.removeItem(STATE_KEY);
}
