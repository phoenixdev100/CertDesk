import { Eye, RotateCcw, X } from 'lucide-react';
import { useCertStore } from '../../store/useCertStore';
import { useToast } from '../ui/Toast';

export default function RowIndicator() {
  const editingRowIdx = useCertStore((s) => s.editingRowIdx);
  const excelData = useCertStore((s) => s.excelData);
  const excelColumns = useCertStore((s) => s.excelColumns);
  const exitRowEdit = useCertStore((s) => s.exitRowEdit);
  const resetRowOverride = useCertStore((s) => s.resetRowOverride);
  const toast = useToast();

  if (editingRowIdx < 0) return null;
  const row = excelData[editingRowIdx];
  const nameKey = excelColumns.find((k) => k.includes('name')) || excelColumns[0];
  const name = row && nameKey && row[nameKey] ? row[nameKey] : `Row ${editingRowIdx + 1}`;

  return (
    <div className="absolute left-3 top-3 flex items-center gap-2 rounded-md border border-line bg-surface px-3 py-1.5 shadow-card">
      <Eye size={12} className="text-brand-600" />
      <span className="text-2xs font-medium text-ink">
        Row {editingRowIdx + 1} of {excelData.length}: {name}
      </span>
      <button
        onClick={() => {
          resetRowOverride(editingRowIdx);
          toast(`Row ${editingRowIdx + 1} overrides cleared`, 'success');
        }}
        className="flex items-center gap-1 rounded px-1.5 py-0.5 text-2xs text-rose-600 hover:bg-rose-50"
      >
        <RotateCcw size={10} /> Reset
      </button>
      <button
        onClick={exitRowEdit}
        className="flex items-center gap-1 rounded px-1.5 py-0.5 text-2xs text-ink-muted hover:bg-surface-subtle"
      >
        <X size={10} /> Exit
      </button>
    </div>
  );
}
