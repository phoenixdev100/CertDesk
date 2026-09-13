import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="flex items-center gap-2 border-b border-line bg-surface px-4 py-2.5">
      <Link to="/" className="flex items-center gap-2 no-underline">
        <img src="/logo.png" alt="CertDesk" className="h-7 w-auto" />
        <h1 className="text-sm font-semibold text-ink">CertDesk</h1>
        <span className="text-2xs text-ink-faint">Certificate Studio</span>
      </Link>
      <span className="ml-auto text-2xs text-ink-faint">
        Drop Excel columns onto the canvas to place them
      </span>
    </header>
  );
}
