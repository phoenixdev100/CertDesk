export default function Section({ icon, title, badge, action, children }) {
  return (
    <section className="border-b border-line px-3 py-3">
      <div className="mb-2 flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-wide text-ink-muted">
        {icon}
        <span>{title}</span>
        {badge && <span className="ml-auto">{badge}</span>}
        {action && <span className="ml-auto">{action}</span>}
      </div>
      {children}
    </section>
  );
}
