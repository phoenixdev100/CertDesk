import { Columns } from 'lucide-react';
import Section from '../ui/Section';
import { useCertStore } from '../../store/useCertStore';

export default function ColumnChips({ source = 'individual' }) {
  const excelColumns = useCertStore((s) => s.excelColumns);
  const teamColumns = useCertStore((s) => s.teamColumns);
  const teams = useCertStore((s) => s.teams);
  const activeColumns = teams.length > 0 ? teamColumns : excelColumns;
  const columns = source === 'active' ? activeColumns : (source === 'team' ? teamColumns : excelColumns);
  if (!columns.length) return null;

  return (
    <Section icon={<Columns size={13} />} title="Column Fields">
      <p className="mb-2 text-2xs text-ink-faint">
        Drag any column chip onto the canvas to place it. Click a placed field to reposition.
      </p>
      <div className="flex flex-wrap gap-1.5">
        {columns.map((col) => (
          <div
            key={col}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('text/plain', col);
              e.dataTransfer.effectAllowed = 'copy';
            }}
            className="chip cursor-grab border-brand-200 bg-brand-50 text-brand-700 hover:bg-brand-100 active:cursor-grabbing"
          >
            {col}
          </div>
        ))}
      </div>
    </Section>
  );
}
