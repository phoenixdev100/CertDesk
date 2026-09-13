import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// Shows a brief animated loader before navigating between routes,
// giving the next page time to mount while providing a smooth UX.
const ROUTE_LABELS = {
  '/studio': 'Loading studio…',
  '/': 'Loading…',
};

export default function RouteLoader({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [label, setLabel] = useState('Loading…');

  // Intercept clicks on internal links to /studio or /
  useEffect(() => {
    const onClick = (e) => {
      const link = e.target.closest('a[href="/studio"], a[href="/"]');
      if (!link) return;
      const href = link.getAttribute('href');
      if (href === location.pathname) return; // already there
      e.preventDefault();
      setLabel(ROUTE_LABELS[href] || 'Loading…');
      setLoading(true);
      setTimeout(() => {
        navigate(href);
      }, 700);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [navigate, location]);

  // Hide loader when route changes
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, [location]);

  return (
    <>
      {children}
      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-surface/95 backdrop-blur-sm animate-fade-in">
          <div className="relative flex h-16 w-16 items-center justify-center">
            <div className="absolute inset-0 animate-spin rounded-full border-2 border-line border-t-brand-600" />
            <img src="/logo.png" alt="CertDesk" className="h-8 w-auto" />
          </div>
          <p className="mt-4 text-2xs font-medium text-ink-muted">{label}</p>
        </div>
      )}
    </>
  );
}
