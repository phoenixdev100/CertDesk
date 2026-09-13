import { STORAGE_KEYS } from '../constants';

// ── SMTP config (host/port/user/fromName only - never the password) ──
export function loadSmtpConfig() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.smtp) || '{}');
  } catch {
    return {};
  }
}

export function saveSmtpConfig(cfg) {
  const safe = {
    host: cfg.host,
    port: cfg.port,
    user: cfg.user,
    fromName: cfg.fromName,
  };
  localStorage.setItem(STORAGE_KEYS.smtp, JSON.stringify(safe));
}

export function isSmtpConfigured(cfg) {
  return !!(cfg && cfg.host && cfg.user);
}

// ── Email draft (subject + body HTML) ────────────────────────────────
export function loadDraft() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.draft) || 'null');
  } catch {
    return null;
  }
}

export function saveDraft(draft) {
  localStorage.setItem(STORAGE_KEYS.draft, JSON.stringify(draft));
}

// ── Reusable email templates ─────────────────────────────────────────
export function loadTemplates() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.templates) || '[]');
  } catch {
    return [];
  }
}

export function saveTemplates(list) {
  localStorage.setItem(STORAGE_KEYS.templates, JSON.stringify(list));
}
