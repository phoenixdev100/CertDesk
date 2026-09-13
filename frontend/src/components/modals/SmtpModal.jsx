import { useState } from 'react';
import { Radio, Plug, Save } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { testSmtp } from '../../api/emailApi';
import { useToast } from '../ui/Toast';

export default function SmtpModal({ open, onClose, config, onSave }) {
  const [form, setForm] = useState(config);
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState(null);
  const toast = useToast();

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const onTest = async () => {
    if (!form.host) return toast('Enter SMTP host first', 'warning');
    if (!form.user) return toast('Enter SMTP username', 'warning');
    if (!form.pass) return toast('Enter SMTP password', 'warning');
    setTesting(true);
    setResult(null);
    try {
      const data = await testSmtp(form);
      setResult(data.ok ? { ok: true, msg: 'Connection successful - SMTP is ready' } : { ok: false, msg: data.error });
    } catch (err) {
      setResult({ ok: false, msg: `Cannot reach server - ${err.message}` });
    } finally {
      setTesting(false);
    }
  };

  const onSaveClick = () => {
    onSave(form);
    toast('SMTP settings saved', 'success');
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="SMTP Configuration"
      icon={<Radio size={15} className="text-ink-muted" />}
      footer={
        <>
          <Button variant="outline" onClick={onTest} disabled={testing}>
            <Plug size={12} /> {testing ? 'Testing…' : 'Test Connection'}
          </Button>
          <Button variant="primary" onClick={onSaveClick}>
            <Save size={12} /> Save Settings
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="label">SMTP Host</label>
            <input className="input" value={form.host || ''} onChange={(e) => set('host', e.target.value)} placeholder="smtp.gmail.com" />
          </div>
          <div className="w-20">
            <label className="label">Port</label>
            <input className="input" type="number" min={1} max={65535} value={form.port || 587} onChange={(e) => set('port', e.target.value)} />
          </div>
        </div>
        <div>
          <label className="label">Username / Email</label>
          <input className="input" value={form.user || ''} onChange={(e) => set('user', e.target.value)} placeholder="you@example.com" />
        </div>
        <div>
          <label className="label">Password / App Password</label>
          <input className="input" type="password" value={form.pass || ''} onChange={(e) => set('pass', e.target.value)} placeholder="••••••••" />
        </div>
        <div>
          <label className="label">From Name (display name)</label>
          <input className="input" value={form.fromName || ''} onChange={(e) => set('fromName', e.target.value)} placeholder="e.g. Certificate Team" />
        </div>
        {result && (
          <div
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-2xs ${
              result.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
            }`}
          >
            {result.ok ? '✓' : '✕'} {result.msg}
          </div>
        )}
        <p className="text-2xs text-ink-faint">
          Password is never stored - it is used only for this session. Gmail users should use an App Password.
        </p>
      </div>
    </Modal>
  );
}
