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

  // ── Team mode ──
  teamMode: false,
  teams: [],          // [{ name, count }]
  teamKey: null,      // column key used for team name (e.g. "team" or "name")
  teamData: [],       // expanded team rows (separate from excelData)
  teamColumns: [],    // columns from team import (separate from excelColumns)

  // ── Per-row preview & overrides ──
  previewRowIdx: 0,      // active preview row (individual side)
  teamPreviewRowIdx: 0,  // active preview row (team side)
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

  // ── Team mode ──
  setTeamMode: (enabled) =>
    set((s) => {
      if (!enabled) {
        // Turning off: clear teams, keep original excelData if any
        return { teamMode: false, teams: [], teamKey: null };
      }
      return { teamMode: true };
    }),

  // Import teams from parsed Excel data
  setTeamsFromExcel: (data, columns) =>
    set((s) => {
      const teamKey =
        columns.find((k) => k.includes('team')) ||
        columns.find((k) => k.includes('name')) ||
        columns[0] ||
        'name';
      const countKey = columns.find((k) => k.includes('count') || k.includes('qty') || k.includes('quantity'));
      const teams = data
        .map((r) => ({
          name: r[teamKey] || '',
          count: countKey ? Math.max(1, parseInt(r[countKey], 10) || 1) : 1,
        }))
        .filter((t) => t.name);
      return { teams, teamKey, teamColumns: columns };
    }),

  // Expand teams into teamData rows (team name repeated count times)
  expandTeams: () =>
    set((s) => {
      const expanded = [];
      for (const team of s.teams) {
        for (let i = 0; i < team.count; i++) {
          expanded.push({ [s.teamKey || 'name']: team.name, name: team.name });
        }
      }
      return {
        teamData: expanded,
        previewRowIdx: 0,
        editingRowIdx: -1,
        rowOverrides: {},
      };
    }),

  updateTeamCount: (idx, count) =>
    set((s) => {
      const teams = [...s.teams];
      teams[idx] = { ...teams[idx], count: Math.max(1, parseInt(count, 10) || 1) };
      return { teams };
    }),

  setAllTeamCounts: (count) =>
    set((s) => ({
      teams: s.teams.map((t) => ({ ...t, count: Math.max(1, parseInt(count, 10) || 1) })),
    })),

  addTeam: (name, count) =>
    set((s) => ({
      teams: [...s.teams, { name, count: Math.max(1, parseInt(count, 10) || 1) }],
      teamKey: s.teamKey || 'name',
      teamColumns: s.teamColumns.length ? s.teamColumns : ['name'],
    })),

  removeTeam: (idx) =>
    set((s) => ({
      teams: s.teams.filter((_, i) => i !== idx),
    })),

  clearTeams: () => set({ teams: [], teamKey: null, teamData: [], teamColumns: [] }),

  selectPreviewRow: (rowIdx) => set({ previewRowIdx: rowIdx }),
  selectTeamPreviewRow: (rowIdx) => set({ teamPreviewRowIdx: rowIdx }),
  exitRowEdit: () => set((s) => ({ previewRowIdx: 0, teamPreviewRowIdx: 0, editingRowIdx: -1 })),
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

  // Returns team data if teams exist, else individual excelData
  getActiveData: () => {
    const s = get();
    return s.teams.length > 0 ? s.teamData : s.excelData;
  },

  // Returns team columns if teams exist, else individual excelColumns
  getActiveColumns: () => {
    const s = get();
    return s.teams.length > 0 ? s.teamColumns : s.excelColumns;
  },
}));
