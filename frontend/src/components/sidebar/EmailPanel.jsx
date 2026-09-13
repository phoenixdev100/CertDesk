import { useState } from 'react';
import { Mail, Send, Settings, PenSquare } from 'lucide-react';
import Section from '../ui/Section';
import Button from '../ui/Button';
import ProgressBar from '../ui/ProgressBar';
import { useCertStore } from '../../store/useCertStore';
import { useToast } from '../ui/Toast';
import { sendCertificate } from '../../api/emailApi';
import { generateCertBlob } from '../../lib/certificate';
import { applyVariables, applyVariablesHtml, buildEmailHtml } from '../../lib/emailTemplate';
import { blobToBase64, safeName } from '../../lib/utils';
import { SEND_DELAY_MS } from '../../constants';

export default function EmailPanel({ smtpConfig, emailSubject, emailBodyHtml, onOpenSmtp, onOpenCompose }) {
  const [progress, setProgress] = useState(null);
  const [log, setLog] = useState(null);
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  const image = useCertStore((s) => s.image);
  const fields = useCertStore((s) => s.fields);
  const excelData = useCertStore((s) => s.excelData);
  const rowOverrides = useCertStore((s) => s.rowOverrides);

  const canSend = excelData.length > 0 && !!smtpConfig?.host && !!smtpConfig?.user && !!smtpConfig?.pass;

  const sendAll = async () => {
    if (!excelData.length) return toast('No recipient data loaded', 'warning');
    if (!image) return toast('Load a certificate template first', 'warning');
    if (!smtpConfig?.host || !smtpConfig?.user || !smtpConfig?.pass) {
      toast('Configure SMTP first', 'warning');
      onOpenSmtp();
      return;
    }

    const recipients = excelData.filter((r) => r.email);
    if (!recipients.length) return toast('No email addresses found', 'warning');

    const subject = emailSubject?.trim() || 'Your Certificate';
    const bodyTpl = emailBodyHtml?.trim() || 'Hi {{firstName}},<br><br>Please find your certificate attached.';

    if (!confirm(`Send ${recipients.length} certificate email(s) via SMTP?\n\nFrom: ${smtpConfig.user}`)) return;

    setBusy(true);
    setLog([]);
    setProgress(0);
    let ok = 0;
    let fail = 0;
    const entries = [];

    for (let i = 0; i < recipients.length; i++) {
      const rowData = recipients[i];
      const dataIdx = excelData.indexOf(rowData);
      setProgress(Math.round((i / recipients.length) * 100));

      try {
        const blob = await generateCertBlob(image, fields, rowData, dataIdx, rowOverrides);
        const base64 = await blobToBase64(blob);
        const subjectFinal = applyVariables(subject, rowData);
        const bodyFinal = buildEmailHtml(applyVariablesHtml(bodyTpl, rowData));
        const filename = `${safeName(rowData.name)}_certificate.png`;

        await sendCertificate({
          smtp: smtpConfig,
          to: rowData.email,
          subject: subjectFinal,
          html: bodyFinal,
          attachmentBase64: base64,
          filename,
        });

        ok++;
        entries.push({ name: rowData.name, email: rowData.email, ok: true });
      } catch (err) {
        fail++;
        entries.push({ name: rowData.name, email: rowData.email, ok: false, error: err.message });
      }
      setLog([...entries]);
      await new Promise((r) => setTimeout(r, SEND_DELAY_MS));
    }

    setProgress(100);
    setBusy(false);
    setTimeout(() => setProgress(null), 3000);
    toast(`${ok} sent, ${fail} failed`, ok > 0 ? 'success' : 'warning');
  };

  return (
    <Section
      icon={<Mail size={13} />}
      title="Send via Email"
      badge={
        <span
          className={`chip ${smtpConfig?.host ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : ''}`}
        >
          {smtpConfig?.host ? 'Configured' : 'Not set'}
        </span>
      }
    >
      <div className="space-y-1.5">
        <div className="flex gap-1.5">
          <Button variant="outline" className="flex-1" onClick={onOpenSmtp}>
            <Settings size={12} /> SMTP
          </Button>
          <Button variant="outline" className="flex-1" onClick={onOpenCompose}>
            <PenSquare size={12} /> Compose
          </Button>
        </div>
        <div className="text-2xs text-ink-faint">
          {emailSubject?.trim() ? emailSubject.trim() : 'No subject set'}
        </div>
        <Button
          variant="primary"
          className="w-full"
          disabled={!canSend || busy}
          onClick={sendAll}
        >
          <Send size={13} /> {busy ? 'Sending…' : 'Send Certificates'}
        </Button>
        {progress != null && <ProgressBar value={progress} label={progress < 100 ? `Sending ${progress}%` : 'Done'} />}
        {log && log.length > 0 && (
          <div className="max-h-32 space-y-1 overflow-auto rounded-md border border-line p-1.5">
            {log.map((entry, i) => (
              <div
                key={i}
                className={`flex items-center gap-1.5 rounded px-1.5 py-1 text-2xs ${
                  entry.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                }`}
              >
                <span className="font-medium">{entry.ok ? '✓' : '✕'}</span>
                <span className="flex-1 truncate">{entry.name}</span>
                <span className="truncate text-ink-faint">{entry.email}</span>
                {!entry.ok && <span className="truncate text-rose-500">{entry.error}</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </Section>
  );
}
