import { esc, escapeRegex } from './utils';

const AMP = String.fromCharCode(38) + 'amp;';
const LT = String.fromCharCode(38) + 'lt;';
const GT = String.fromCharCode(38) + 'gt;';

const HAS_TAGS = /<[a-z][\s\S]*?>/i;
const P_STYLE = 'margin:0 0 1em 0';

export function applyVariables(template, rowData) {
  const name = rowData.name || '';
  const email = rowData.email || '';
  const enriched = { ...rowData, firstName: name.trim().split(/\s+/)[0] || '', name, email };
  let result = template;
  for (const [key, val] of Object.entries(enriched)) {
    result = result.replace(new RegExp(`\\{\\{${escapeRegex(key)}\\}\\}`, 'g'), String(val || ''));
  }
  return result;
}

export function applyVariablesHtml(htmlTemplate, rowData) {
  const name = rowData.name || '';
  const email = rowData.email || '';
  const enriched = { ...rowData, firstName: name.trim().split(/\s+/)[0] || '', name, email };
  let result = htmlTemplate;
  for (const [key, val] of Object.entries(enriched)) {
    result = result.replace(new RegExp(`\\{\\{${escapeRegex(key)}\\}\\}`, 'g'), esc(String(val || '')));
  }
  return result;
}

function plainTextToHtml(text) {
  const escaped = text
    .replace(/&/g, AMP)
    .replace(/</g, LT)
    .replace(/>/g, GT);
  const lines = escaped.split('\n');
  const paragraphs = [];
  let cur = [];
  for (const line of lines) {
    if (line === '') {
      if (cur.length) { paragraphs.push(cur.join('<br>')); cur = []; }
    } else {
      cur.push(line);
    }
  }
  if (cur.length) paragraphs.push(cur.join('<br>'));
  return paragraphs.map((p) => `<p style="${P_STYLE}">${p}</p>`).join('');
}

export function normaliseBodyHtml(raw) {
  if (!HAS_TAGS.test(raw)) return plainTextToHtml(raw);

  const s1 = raw.replace(/<\/div>\s*<div>\s*<br\s*\/?>\s*<\/div>\s*<div>/gi, '\u00A7P\u00A7');
  const s2 = s1.replace(/<\/div>\s*<div>/gi, '<br>');
  const s3 = s2.replace(/<\/?div>/gi, '');
  const paragraphs = s3.split('\u00A7P\u00A7');
  return paragraphs.map((p) => `<p style="${P_STYLE}">${p}</p>`).join('');
}

export function buildEmailHtml(bodyHtml) {
  const content = normaliseBodyHtml(bodyHtml);
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="margin:0;padding:16px;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#000000;line-height:1.5;background:#ffffff">${content}</body></html>`;
}

export function contentToEditorHtml(stored) {
  if (!HAS_TAGS.test(stored)) {
    return stored
      .replace(/&/g, AMP)
      .replace(/</g, LT)
      .replace(/>/g, GT)
      .split('\n')
      .map((line) => `<div>${line === '' ? '<br>' : esc(line)}</div>`)
      .join('');
  }
  return stored;
}
