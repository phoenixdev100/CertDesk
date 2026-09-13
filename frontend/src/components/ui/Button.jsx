const VARIANTS = {
  primary:
    'bg-brand-600 border-brand-600 text-white hover:bg-brand-700 hover:border-brand-700',
  outline:
    'bg-surface border-line text-ink hover:bg-surface-subtle hover:border-line-strong',
  success:
    'bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-700 hover:border-emerald-700',
  danger:
    'bg-surface border-line text-rose-600 hover:bg-rose-50 hover:border-rose-200',
  ghost:
    'bg-transparent border-transparent text-ink-muted hover:bg-surface-subtle hover:text-ink',
};

export default function Button({
  variant = 'outline',
  className = '',
  children,
  ...props
}) {
  return (
    <button className={`btn ${VARIANTS[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
