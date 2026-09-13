export default function ProgressBar({ value, label }) {
  if (value == null) return null;
  return (
    <div className="mt-2">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-subtle">
        <div
          className="h-full rounded-full bg-brand-500 transition-all"
          style={{ width: `${value}%` }}
        />
      </div>
      {label && <div className="mt-1 text-2xs text-ink-faint">{label}</div>}
    </div>
  );
}
