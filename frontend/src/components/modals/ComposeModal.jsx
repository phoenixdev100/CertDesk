import { useRef, useState, useEffect } from 'react';
import { Mail, Link2, Save } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { useCertStore } from '../../store/useCertStore';
import { useToast } from '../ui/Toast';
import { contentToEditorHtml } from '../../lib/emailTemplate';
import { loadTemplates, saveTemplates } from '../../lib/storage';
import { esc } from '../../lib/utils';

export default function ComposeModal({ open, onClose, subject, onSubjectChange, bodyHtml, onBodyChange }) {
  const bodyRef = useRef(null);
  const excelColumns = useCertStore((s) => s.excelColumns);
  const toast = useToast();
  const [templateName, setTemplateName] = useState('');

  // Sync editor content when modal opens
  useEffect(() => {
    if (open && bodyRef.current) {
      bodyRef.current.innerHTML = contentToEditorHtml(bodyHtml || '');
    }
  }, [open, bodyHtml]);

  const exec = (cmd) => {
    document.execCommand(cmd, false, null);
    bodyRef.current?.focus();
    onBodyChange(bodyRef.current?.innerHTML || '');
  };

  const insertLink = () => {
    const url = prompt('Enter URL:', 'https://');
    if (!url || url === 'https://') return;
    const sel = window.getSelection();
    const selectedText = sel && sel.toString().trim();
    if (selectedText) {
      document.execCommand('createLink', false, url);
      bodyRef.current?.querySelectorAll('a').forEach((a) => {
        if (a.getAttribute('href') === url) a.setAttribute('target', '_blank');
      });
    } else {
      const label = prompt('Link text:', url);
      if (!label) return;
      document.execCommand('insertHTML', false, `<a href="${esc(url)}" target="_blank">${esc(label)}</a>`);
    }
    onBodyChange(bodyRef.current?.innerHTML || '');
  };

  const insertVariable = (variable) => {
    bodyRef.current?.focus();
    const sel = window.getSelection();
    if (sel && sel.rangeCount && bodyRef.current?.contains(sel.getRangeAt(0).commonAncestorContainer)) {
      const range = sel.getRangeAt(0);
      range.deleteContents();
      const node = document.createTextNode(variable);
      range.insertNode(node);
      range.setStartAfter(node);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    } else {
      bodyRef.current.innerHTML += variable;
    }
    onBodyChange(bodyRef.current?.innerHTML || '');
  };

  const saveTemplate = () => {
    const name = templateName.trim() || prompt('Template name:');
    if (!name || !name.trim()) return;
    const list = loadTemplates();
    list.push({ name: name.trim(), subject, bodyHtml: bodyRef.current?.innerHTML || '' });
    saveTemplates(list);
    setTemplateName('');
    toast(`Template "${name.trim()}" saved`, 'success');
  };

  const loadTemplate = (val) => {
    if (!val) return;
    const list = loadTemplates();
    if (val.startsWith('del_')) {
      const idx = parseInt(val.replace('del_', ''), 10);
      if (!confirm(`Delete template "${list[idx]?.name}"?`)) return;
      list.splice(idx, 1);
      saveTemplates(list);
      toast('Template deleted');
      return;
    }
    const t = list[parseInt(val, 10)];
    if (!t) return;
    onSubjectChange(t.subject || '');
    if (bodyRef.current) {
      bodyRef.current.innerHTML = contentToEditorHtml(t.bodyHtml || '');
      onBodyChange(bodyRef.current.innerHTML);
    }
    toast(`Template "${t.name}" loaded`, 'success');
  };

  const templates = loadTemplates();
  const variables = ['firstName', ...excelColumns];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Compose Email"
      icon={<Mail size={15} className="text-ink-muted" />}
      wide
      footer={<Button variant="primary" onClick={onClose}>Done</Button>}
    >
      <div className="space-y-3">
        <div>
          <label className="label">Subject</label>
          <input
            className="input"
            value={subject}
            onChange={(e) => onSubjectChange(e.target.value)}
            placeholder="Congratulations, {{firstName}}!"
          />
        </div>
        <div>
          <label className="label">Variables - click to insert at cursor</label>
          <div className="flex flex-wrap gap-1">
            {variables.length === 1 && !excelColumns.length ? (
              <span className="text-2xs text-ink-faint">Upload an Excel file to see column variables</span>
            ) : (
              variables.map((col) => (
                <button
                  key={col}
                  onClick={() => insertVariable(`{{${col}}}`)}
                  className="chip border-brand-200 bg-brand-50 text-brand-700 hover:bg-brand-100"
                >
                  {`{{${col}}}`}
                </button>
              ))
            )}
          </div>
        </div>
        <div>
          <label className="label">Body</label>
          <div className="mb-1.5 flex items-center gap-1 rounded-md border border-line bg-surface-subtle px-1.5 py-1">
            <button onClick={() => exec('bold')} className="rounded px-1.5 py-0.5 text-xs font-bold hover:bg-surface">B</button>
            <button onClick={() => exec('italic')} className="rounded px-1.5 py-0.5 text-xs italic hover:bg-surface">I</button>
            <button onClick={() => exec('underline')} className="rounded px-1.5 py-0.5 text-xs underline hover:bg-surface">U</button>
            <div className="mx-1 h-4 w-px bg-line" />
            <button onClick={insertLink} className="flex items-center gap-1 rounded px-1.5 py-0.5 text-2xs hover:bg-surface">
              <Link2 size={11} /> Link
            </button>
            <div className="mx-1 h-4 w-px bg-line" />
            <button onClick={saveTemplate} className="flex items-center gap-1 rounded px-1.5 py-0.5 text-2xs hover:bg-surface">
              <Save size={10} /> Save Template
            </button>
            <select
              onChange={(e) => { loadTemplate(e.target.value); e.target.value = ''; }}
              className="ml-auto rounded border border-line bg-surface px-1.5 py-0.5 text-2xs"
            >
              <option value="">Load Template…</option>
              {templates.map((t, i) => <option key={i} value={i}>{t.name}</option>)}
              {templates.length > 0 && <option disabled>─────────</option>}
              {templates.map((t, i) => <option key={`d${i}`} value={`del_${i}`}>✕ {t.name}</option>)}
            </select>
          </div>
          <div
            ref={bodyRef}
            contentEditable
            suppressContentEditableWarning
            onInput={() => onBodyChange(bodyRef.current?.innerHTML || '')}
            data-placeholder="Hi {{firstName}},&#10;&#10;Congratulations! Please find your certificate attached.&#10;&#10;Best regards,&#10;The Team"
            className="email-body-editor min-h-[160px] w-full rounded-md border border-line bg-surface p-3 text-xs text-ink outline-none focus:border-brand-500"
          />
          <p className="mt-1 text-2xs text-ink-faint">
            Variables are replaced per recipient when sending. <b>firstName</b> is derived from the name column.
          </p>
        </div>
      </div>
    </Modal>
  );
}
