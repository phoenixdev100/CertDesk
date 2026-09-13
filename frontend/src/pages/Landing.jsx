import { Link } from 'react-router-dom';
import { ArrowRight, FileCheck, Mail, Download, Palette } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-surface animate-fade-in-up">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-line">
        <Link to="/" className="flex items-center gap-2 no-underline">
          <img src="/logo.png" alt="CertDesk" className="h-8 w-auto" />
          <span className="text-base font-bold text-ink">CertDesk</span>
          <span className="text-2xs font-medium text-ink-faint">Certificate Studio</span>
        </Link>
        <Link
          to="/studio"
          className="flex items-center gap-1.5 rounded-md bg-brand-600 px-4 py-2 text-2xs font-semibold text-white hover:bg-brand-700"
        >
          Open Studio <ArrowRight size={12} />
        </Link>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-8 py-20 text-center">
        <img src="/logo.png" alt="CertDesk" className="mx-auto mb-8 h-20 w-auto" />
        <h1 className="text-4xl font-bold text-ink">
          Design, generate & deliver certificates
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm text-ink-muted">
          Upload a template, import recipients from Excel, drag fields onto the canvas,
          style them, then export or email - all in one place.
        </p>
        <Link
          to="/studio"
          className="mt-8 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-card hover:bg-brand-700"
        >
          Launch Studio <ArrowRight size={14} />
        </Link>
      </section>

      {/* Features */}
      <section className="mx-auto grid max-w-4xl grid-cols-1 gap-6 px-8 pb-20 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: FileCheck, title: 'Import anything', desc: 'PNG, JPG, WebP, or PDF templates' },
          { icon: Palette, title: 'Full styling', desc: '110+ fonts, colors, shadows, alignment' },
          { icon: Download, title: 'Export anywhere', desc: 'PNG, PDF, JPEG - single or bulk ZIP' },
          { icon: Mail, title: 'SMTP delivery', desc: 'Send certificates directly via email' },
        ].map((f) => (
          <div key={f.title} className="rounded-lg border border-line bg-surface p-5 shadow-card">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-brand-50 text-brand-600">
              <f.icon size={16} />
            </div>
            <h3 className="text-xs font-semibold text-ink">{f.title}</h3>
            <p className="mt-1 text-2xs text-ink-faint">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="border-t border-line px-8 py-6 text-center">
        <img src="/logo.png" alt="CertDesk" className="mx-auto mb-2 h-6 w-auto" />
        <p className="text-2xs text-ink-faint">CertDesk - Certificate Studio</p>
      </footer>
    </div>
  );
}
