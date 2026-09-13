import { create } from 'zustand';
import { FONTS } from '../lib/fonts';
import { defaultTypography, pickTypography } from '../lib/typography';

export const useCertStore = create((set, get) => ({
  // ── Certificate image ──
  image: null,
  naturalW: 0,
  naturalH: 0,

  // ── Fields placed on the canvas ──
  fields: [],            // [{ key, x, y, ...typography, _bbox }]
  activeFieldIdx: -1,

  // ── Excel data ──
  excelData: [],
  excelColumns: [],
  nameKey: null,
  emailKey: null,

  // ── Per-row preview & overrides ──
  previewRowIdx: 0,
  editingRowIdx: -1,    // -1 = global; >=0 = row-edit mode
  rowOverrides: {},     // { rowIdx: { fieldKey: { x?, y?, ...typo } } }

  // ── Zoom ──
  zoomIdx: 3,
  scale: 0.65,

  // ── Font picker hover ──
  hoverFont: null,
  committedFont: FONTS[0].value,

  // ───────────────────────────────
  // Actions
  // ───────────────────────────────
  setImage: (image) =>
    set({
      image,
      naturalW: image.naturalWidth,
      naturalH: image.naturalHeight,
    }),

  clearImage: () =>
    set({
      image: null,
      naturalW: 0,
      naturalH: 0,
      fields: [],
      activeFieldIdx: -1,
    }),

  addField: (key, x, y) =>
    set((s) => {
      const field = { key, x, y, ...defaultTypography(), _bbox: null };
      return { fields: [...s.fields, field], activeFieldIdx: s.fields.length };
    }),

  removeField: (idx) =>
    set((s) => {
      const key = s.fields[idx]?.key;
      const rowOverrides = { ...s.rowOverrides };
      for (const r of Object.keys(rowOverrides)) {
        if (rowOverrides[r][key]) {
          rowOverrides[r] = { ...rowOverrides[r] };
          delete rowOverrides[r][key];
        }
      }
      const fields = s.fields.filter((_, i) => i !== idx);
      return {
        fields,
        activeFieldIdx: -1,
        rowOverrides,
      };
    }),

  selectField: (idx) => set({ activeFieldIdx: idx }),

  // Update the active field's typography (global mode)
  updateActiveFieldTypography: (typo) =>
    set((s) => {
      if (s.activeFieldIdx < 0) return s;
      const fields = [...s.fields];
      fields[s.activeFieldIdx] = { ...fields[s.activeFieldIdx], ...typo };
      return { fields };
    }),

  // Update typography as a per-row override
  overrideActiveFieldTypography: (typo) =>
    set((s) => {
      if (s.activeFieldIdx < 0 || s.editingRowIdx < 0) return s;
      const key = s.fields[s.activeFieldIdx].key;
      const rowOverrides = { ...s.rowOverrides };
      if (!rowOverrides[s.editingRowIdx]) rowOverrides[s.editingRowIdx] = {};
      rowOverrides[s.editingRowIdx] = {
        ...rowOverrides[s.editingRowIdx],
        [key]: { ...rowOverrides[s.editingRowIdx][key], ...typo },
      };
      return { rowOverrides };
    }),

  // Update position (global)
  updateActiveFieldPosition: (x, y) =>
    set((s) => {
      if (s.activeFieldIdx < 0) return s;
      const fields = [...s.fields];
      fields[s.activeFieldIdx] = { ...fields[s.activeFieldIdx], x, y };
      return { fields };
    }),

  // Position override for a specific row
  overrideActiveFieldPosition: (x, y) =>
    set((s) => {
      if (s.activeFieldIdx < 0 || s.editingRowIdx < 0) return s;
      const key = s.fields[s.activeFieldIdx].key;
      const rowOverrides = { ...s.rowOverrides };
      if (!rowOverrides[s.editingRowIdx]) rowOverrides[s.editingRowIdx] = {};
      rowOverrides[s.editingRowIdx] = {
        ...rowOverrides[s.editingRowIdx],
        [key]: { ...rowOverrides[s.editingRowIdx][key], x, y },
      };
      return { rowOverrides };
    }),

  setExcelData: (data, columns) =>
    set({
      excelData: data,
      excelColumns: columns,
      nameKey: columns.find((k) => k.includes('name')) || columns[0] || null,
      emailKey: columns.find((k) => k.includes('email')) || columns[1] || null,
      previewRowIdx: 0,
      editingRowIdx: -1,
      rowOverrides: {},
    }),

  clearExcel: () =>
    set({
      excelData: [],
      excelColumns: [],
      nameKey: null,
      emailKey: null,
      fields: [],
      activeFieldIdx: -1,
      previewRowIdx: 0,
      editingRowIdx: -1,
      rowOverrides: {},
    }),

  selectPreviewRow: (rowIdx) => set({ previewRowIdx: rowIdx }),
  exitRowEdit: () => set({ previewRowIdx: 0, editingRowIdx: -1 }),
  resetRowOverride: (rowIdx) =>
    set((s) => {
      const rowOverrides = { ...s.rowOverrides };
      delete rowOverrides[rowIdx];
      return { rowOverrides };
    }),

  setZoom: (zoomIdx, scale) => set({ zoomIdx, scale }),
  setHoverFont: (font) => set({ hoverFont: font }),
  setCommittedFont: (font) => set({ committedFont: font }),

  // Read current typography of the effective active field
  getActiveFieldTypography: () => {
    const s = get();
    if (s.activeFieldIdx < 0) return null;
    return pickTypography(s.fields[s.activeFieldIdx]);
  },
}));
