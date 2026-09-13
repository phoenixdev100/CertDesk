import { Crosshair } from 'lucide-react';
import Section from '../ui/Section';
import { useCertStore } from '../../store/useCertStore';

export default function FieldPosition() {
  const activeFieldIdx = useCertStore((s) => s.activeFieldIdx);
  const fields = useCertStore((s) => s.fields);
  const previewRowIdx = useCertStore((s) => s.previewRowIdx);
  const rowOverrides = useCertStore((s) => s.rowOverrides);

  const field = activeFieldIdx >= 0 ? fields[activeFieldIdx] : null;
  const effective = field
    ? (previewRowIdx >= 0 && rowOverrides[previewRowIdx]?.[field.key]
        ? { ...field, ...rowOverrides[previewRowIdx][field.key] }
        : field)
    : null;

  return (
    <Section icon={<Crosshair size={13} />} title="Field Position">
      <div className="flex gap-2">
        <div className="chip">
          X: <span className="text-ink">{effective ? Math.round(effective.x * 100) + '%' : '-'}</span>
        </div>
        <div className="chip">
          Y: <span className="text-ink">{effective ? Math.round(effective.y * 100) + '%' : '-'}</span>
        </div>
      </div>
    </Section>
  );
}
