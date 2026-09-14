import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Menu, X, FileCheck, Mail, Download, Palette,
  MousePointerClick, Layers, Zap, Shield, CheckCircle2,
  ChevronDown, Upload, Table, Type, Send, Github,
} from 'lucide-react';

export default function Landing() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'How it works', href: '#how-it-works' },
    { label: 'Stats', href: '#stats' },
    { label: 'FAQ', href: '#faq' },
  ];

  const features = [
    { icon: FileCheck, title: 'Import anything', desc: 'Upload PNG, JPG, WebP, GIF, or PDF certificate templates. Drag & drop or browse.' },
    { icon: Table, title: 'Excel & CSV import', desc: 'Import recipients from Excel or CSV. Auto-detects name and email columns instantly.' },
    { icon: MousePointerClick, title: 'Drag & drop canvas', desc: 'Drag spreadsheet columns onto the certificate. Position fields with mouse or touch. Resize with corner handles.' },
    { icon: Palette, title: '110+ fonts & styling', desc: 'Browse 110+ fonts with live search. Bold, italic, underline, colors, shadows, alignment, and text transforms.' },
    { icon: Download, title: 'Multi-format export', desc: 'Export as PNG, PDF, or JPEG. Download single certificates or bulk ZIP with one click.' },
    { icon: Mail, title: 'SMTP email delivery', desc: 'Send certificates directly via your SMTP server. Rich-text templates, variable substitution, and send progress tracking.' },
  ];

  const steps = [
    { icon: Upload, title: 'Upload template', desc: 'Drop your certificate background image or PDF. We support all major formats.' },
    { icon: Table, title: 'Import recipients', desc: 'Upload an Excel or CSV file. Name and email columns are auto-detected.' },
    { icon: Type, title: 'Style & position', desc: 'Drag columns onto the canvas. Choose fonts, colors, sizes, shadows, and alignment.' },
    { icon: Send, title: 'Export or email', desc: 'Download as PNG/PDF/JPEG or send directly via SMTP with rich-text emails.' },
  ];

  const stats = [
    { value: '110+', label: 'Fonts available' },
    { value: '5+', label: 'Import formats' },
    { value: '3', label: 'Export formats' },
    { value: '∞', label: 'Certificates' },
  ];

  const faqs = [
    { q: 'What file formats can I import as a certificate template?', a: 'You can import PNG, JPG, JPEG, WebP, GIF, and PDF files. PDFs are automatically rasterized to the first page.' },
    { q: 'Can I import recipients from Excel?', a: 'Yes. CertDesk supports .xlsx, .xls, and .csv files. Name and email columns are auto-detected based on column headers.' },
    { q: 'What export formats are available?', a: 'You can export certificates as PNG, PDF, or JPEG. Single certificates or bulk ZIP downloads are both supported.' },
    { q: 'Does CertDesk store my SMTP password?', a: 'No. SMTP passwords are never persisted. Only host, port, username, and sender name are saved to localStorage for convenience.' },
    { q: 'Is my work saved if I refresh the page?', a: 'Yes. Your certificate image, placed fields, Excel data, and styling are all persisted across refreshes using IndexedDB and localStorage.' },
    { q: 'Can I send certificates via email?', a: 'Yes. Configure your SMTP server in the settings, compose a rich-text email with variable substitution ({{name}}, {{firstName}}), and send to all recipients with progress tracking.' },
  ];

  return (
    <div className="min-h-screen bg-surface">
      {/* ── Navbar ── */}
      <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled ? 'border-b border-line bg-surface/90 backdrop-blur-md shadow-card' : 'bg-surface/60 backdrop-blur-sm'}`}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 sm:py-3.5">
          <Link to="/" className="flex items-center gap-2 no-underline">
            <img src="/logo.png" alt="CertDesk" className="h-7 w-auto sm:h-8" />
            <span className="text-sm font-bold text-ink sm:text-base">CertDesk</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-5 lg:gap-7 md:flex">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} className="text-xs font-medium text-ink-muted transition-colors hover:text-ink">
                {l.label}
              </a>
            ))}
            <Link
              to="/studio"
              className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-card transition-all hover:bg-brand-700 hover:shadow-md"
            >
              Open Studio <ArrowRight size={13} />
            </Link>
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setMobileMenu((v) => !v)} className="md:hidden text-ink-muted">
            {mobileMenu ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenu && (
          <div className="border-t border-line bg-surface px-4 py-4 md:hidden animate-fade-in">
            <div className="flex flex-col gap-3">
              {navLinks.map((l) => (
                <a key={l.href} href={l.href} onClick={() => setMobileMenu(false)} className="text-xs font-medium text-ink-muted hover:text-ink">
                  {l.label}
                </a>
              ))}
              <Link to="/studio" className="mt-2 flex items-center justify-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white">
                Open Studio <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-24 pb-16 sm:pt-32 sm:pb-20 animate-fade-in-up">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-50/60 via-surface to-surface" />
        <div className="absolute left-1/2 top-0 -z-10 h-[300px] w-[400px] -translate-x-1/2 rounded-full bg-brand-100/30 blur-3xl sm:h-[400px] sm:w-[600px]" />

        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-2xs font-medium text-ink-muted shadow-card sm:mb-6">
            <span className="flex h-1.5 w-1.5 rounded-full bg-green-500" />
            Open source · MIT License
          </div>

          <img src="/logo.png" alt="CertDesk" className="mx-auto mb-5 h-12 w-auto sm:mb-6 sm:h-16" />

          <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl lg:text-6xl">
            Design, generate & deliver
            <br />
            <span className="bg-gradient-to-r from-brand-600 to-brand-500 bg-clip-text text-transparent">
              certificates at scale
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-xs text-ink-muted sm:mt-5 sm:text-sm lg:text-base">
            Upload a template, import recipients from Excel, drag data fields onto the canvas,
            style them with 110+ fonts, then export as PNG/PDF or email via SMTP - all in one place.
          </p>

          <div className="mt-6 flex flex-col items-center justify-center gap-2.5 sm:mt-8 sm:flex-row sm:gap-3">
            <Link
              to="/studio"
              className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-brand-600/20 transition-all hover:bg-brand-700 hover:shadow-xl hover:shadow-brand-600/30 sm:w-auto sm:px-6"
            >
              Launch Studio <ArrowRight size={13} />
            </Link>
            <a
              href="#features"
              className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-line bg-surface px-5 py-2.5 text-xs font-semibold text-ink transition-all hover:border-line-strong hover:bg-surface-subtle sm:w-auto sm:px-6"
            >
              Explore features <ChevronDown size={13} />
            </a>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-2xs text-ink-faint sm:mt-10 sm:gap-6">
            <span className="flex items-center gap-1"><CheckCircle2 size={12} className="text-green-500" /> No signup</span>
            <span className="flex items-center gap-1"><CheckCircle2 size={12} className="text-green-500" /> Self-hosted</span>
            <span className="flex items-center gap-1"><CheckCircle2 size={12} className="text-green-500" /> Open source</span>
          </div>
        </div>
      </section>

      {/* ── Trusted by / Logos strip ── */}
      <section className="border-y border-line bg-surface-subtle/50 py-5 sm:py-6">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <p className="text-center text-2xs font-medium uppercase tracking-widest text-ink-faint">
            Built for educators, organizations & teams
          </p>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="mb-10 text-center sm:mb-12">
          <span className="text-2xs font-semibold uppercase tracking-widest text-brand-600">Features</span>
          <h2 className="mt-2 text-xl font-bold text-ink sm:text-2xl lg:text-3xl">Everything you need to create certificates</h2>
          <p className="mx-auto mt-3 max-w-xl text-xs text-ink-muted sm:text-sm">
            A complete toolkit for designing, generating, and delivering professional certificates.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-line bg-surface p-5 shadow-card transition-all hover:border-brand-200 hover:shadow-lg sm:p-6"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white sm:h-11 sm:w-11">
                <f.icon size={18} />
              </div>
              <h3 className="text-sm font-semibold text-ink">{f.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-ink-muted">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="border-y border-line bg-surface-subtle/50 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="mb-10 text-center sm:mb-12">
            <span className="text-2xs font-semibold uppercase tracking-widest text-brand-600">How it works</span>
            <h2 className="mt-2 text-xl font-bold text-ink sm:text-2xl lg:text-3xl">From template to delivery in 4 steps</h2>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <div key={s.title} className="relative">
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="absolute left-full top-8 hidden h-px w-full -translate-x-4 bg-line lg:block" />
                )}
                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-line bg-surface shadow-card sm:h-16 sm:w-16">
                  <s.icon size={20} className="text-brand-600 sm:size-6" />
                  <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-2xs font-bold text-white sm:h-6 sm:w-6">
                    {i + 1}
                  </span>
                </div>
                <h3 className="mt-4 text-sm font-semibold text-ink">{s.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section id="stats" className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="rounded-3xl border border-line bg-gradient-to-br from-brand-50/50 to-surface p-6 shadow-card sm:p-10">
          <div className="grid grid-cols-2 gap-6 text-center sm:gap-8 lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="text-2xl font-bold text-brand-600 sm:text-3xl lg:text-4xl">{s.value}</div>
                <div className="mt-1 text-xs font-medium text-ink-muted">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Highlight cards ── */}
      <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6 sm:pb-20">
        <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-3">
          {[
            { icon: Zap, title: 'Fast & lightweight', desc: 'No bloat. Pure React + Vite. Your browser does the work.' },
            { icon: Shield, title: 'Privacy first', desc: 'Self-hosted. Your data never leaves your machine. No tracking.' },
            { icon: Layers, title: 'Auto-saves everything', desc: 'Your workspace persists across refreshes. Never lose your progress.' },
          ].map((h) => (
            <div key={h.title} className="rounded-2xl border border-line bg-surface p-5 shadow-card sm:p-6">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-surface-subtle text-brand-600 sm:h-10 sm:w-10">
                <h.icon size={16} />
              </div>
              <h3 className="text-sm font-semibold text-ink">{h.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">{h.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="mx-auto max-w-4xl px-4 pb-16 sm:px-6 sm:pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-brand-600 px-6 py-10 text-center shadow-xl shadow-brand-600/20 sm:px-8 sm:py-14">
          {/* Decorative blur */}
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl sm:h-40 sm:w-40" />
          <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10 blur-2xl sm:h-40 sm:w-40" />

          <h2 className="relative text-xl font-bold text-white sm:text-2xl lg:text-3xl">
            Ready to create your first certificate?
          </h2>
          <p className="relative mx-auto mt-3 max-w-md text-xs text-white/80 sm:text-sm">
            No signup. No install. Just open the studio and start designing.
          </p>
          <Link
            to="/studio"
            className="relative mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-brand-600 shadow-lg transition-all hover:bg-brand-50 hover:shadow-xl sm:mt-7 sm:px-7"
          >
            Launch Studio <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="mx-auto max-w-3xl px-4 pb-16 sm:px-6 sm:pb-20">
        <div className="mb-8 text-center sm:mb-10">
          <span className="text-2xs font-semibold uppercase tracking-widest text-brand-600">FAQ</span>
          <h2 className="mt-2 text-xl font-bold text-ink sm:text-2xl lg:text-3xl">Frequently asked questions</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((f, i) => (
            <div key={i} className="rounded-xl border border-line bg-surface shadow-card overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex w-full items-center justify-between px-4 py-4 text-left sm:px-5"
              >
                <span className="text-xs font-medium text-ink sm:text-sm">{f.q}</span>
                <ChevronDown
                  size={16}
                  className={`shrink-0 text-ink-faint transition-transform ${openFaq === i ? 'rotate-180' : ''}`}
                />
              </button>
              {openFaq === i && (
                <div className="px-4 pb-4 text-xs leading-relaxed text-ink-muted sm:px-5">
                  {f.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-line bg-surface-subtle/30">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <Link to="/" className="flex items-center gap-2 no-underline">
              <img src="/logo.png" alt="CertDesk" className="h-6 w-auto" />
              <span className="text-sm font-bold text-ink">CertDesk</span>
            </Link>

            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-5">
              <Link to="/studio" className="text-xs text-ink-muted hover:text-ink">Studio</Link>
              <a href="#features" className="text-xs text-ink-muted hover:text-ink">Features</a>
              <a href="#faq" className="text-xs text-ink-muted hover:text-ink">FAQ</a>
              <a href="https://github.com/phoenixdev100/CertDesk" target="_blank" rel="noopener noreferrer" className="text-ink-muted hover:text-ink">
                <Github size={15} />
              </a>
            </div>
          </div>

          <div className="mt-5 border-t border-line pt-4 text-center">
            <p className="text-2xs text-ink-faint">
              © 2025 CertDesk · MIT License · Made with ❤️ by{' '}
              <a href="https://github.com/phoenixdev100" target="_blank" rel="noopener noreferrer" className="font-medium text-ink-muted hover:text-ink">
                Deepak
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
