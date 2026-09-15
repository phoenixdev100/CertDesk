import { Link } from 'react-router-dom';
import { Download } from 'lucide-react';
import { useCertStore } from '../../store/useCertStore';

export default function Header({ onOpenExport }) {
  const teams = useCertStore((s) => s.teams);
  const excelData = useCertStore((s) => s.excelData);
  const teamData = useCertStore((s) => s.teamData);
  const totalRows = teams.length > 0 ? teamData.length : excelData.length;

  return (
    <header className="flex items-center gap-2 border-b border-line bg-surface px-4 py-2.5">
      <Link to="/" className="flex items-center gap-2 no-underline">
        <img src="/logo.png" alt="CertDesk" className="h-7 w-auto" />
        <h1 className="text-sm font-semibold text-ink">CertDesk</h1>
        <span className="text-2xs text-ink-faint">Certificate Studio</span>
      </Link>
      <button
        onClick={onOpenExport}
        className="ml-auto flex items-center gap-1.5 rounded-md bg-brand-600 px-3 py-1.5 text-2xs font-semibold text-white transition-colors hover:bg-brand-700"
        title="Export certificates"
      >
        <Download size={13} />
        Export
        {totalRows > 0 && (
          <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-2xs">{totalRows}</span>
        )}
      </button>
    </header>
  );
}
