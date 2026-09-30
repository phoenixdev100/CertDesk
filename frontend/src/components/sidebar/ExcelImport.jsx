import { useRef, useState } from 'react';
import { FileSpreadsheet, Upload, Trash2 } from 'lucide-react';
import Section from '../ui/Section';
import Button from '../ui/Button';
import { useCertStore } from '../../store/useCertStore';
import { parseExcelFile } from '../../hooks/useExcelImport';
import { useToast } from '../ui/Toast';
import ColumnChips from './ColumnChips';

export default function ExcelImport() {
  const fileRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState('');
  const setExcelData = useCertStore((s) => s.setExcelData);
  const clearExcel = useCertStore((s) => s.clearExcel);
  const excelData = useCertStore((s) => s.excelData);
  const excelColumns = useCertStore((s) => s.excelColumns);
  const previewRowIdx = useCertStore((s) => s.previewRowIdx);
  const editingRowIdx = useCertStore((s) => s.editingRowIdx);
  const rowOverrides = useCertStore((s) => s.rowOverrides);
  const selectPreviewRow = useCertStore((s) => s.selectPreviewRow);
  const toast = useToast();

  const handleFile = async (file) => {
    if (!file) return;
    try {
      const { excelData, columns } = await parseExcelFile(file);
      setExcelData(excelData, columns);
      setFileName(`${file.name} (${excelData.length} rows)`);
      toast(`Loaded ${excelData.length} rows - ${columns.length} columns detected`, 'success');
    } catch (err) {
      toast(err.message || 'Failed to parse file', 'warning');
    }
  };

  const displayCols = excelColumns.slice(0, 4);

  return (
    <Section
      icon={<FileSpreadsheet size={13} />}
      title="Recipients"
      badge={excelData.length ? <span className="chip">{excelData.length} rows</span> : null}
    >
      <div className="mb-2">
        <label className="label">Upload .xlsx / .xls / .csv</label>
        <div
          className={`flex cursor-pointer items-center gap-2 rounded-md border border-dashed px-3 py-2.5 text-2xs transition-colors ${
            dragOver ? 'border-brand-500 bg-brand-50' : 'border-line-strong bg-surface-subtle'
          }`}
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFile(e.dataTransfer.files[0]);
          }}
        >
          <Upload size={14} className="text-ink-faint" />
          <span className="text-ink-muted">{fileName || 'Click to upload or drag & drop'}</span>
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={(e) => handleFile(e.target.files[0])}
          />
        </div>
      </div>

      {excelData.length > 0 && (
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-2xs font-medium text-ink-muted">
              {excelData.length} rows · {excelColumns.length} columns
            </span>
            <Button variant="danger" onClick={() => { clearExcel(); setFileName(''); }}>
              <Trash2 size={11} /> Clear
            </Button>
          </div>
          <div className="max-h-32 overflow-auto rounded-md border border-line">
            <table className="w-full text-2xs">
              <thead className="sticky top-0 bg-surface-subtle text-ink-muted">
                <tr>
                  <th className="px-1.5 py-1 text-left font-medium">#</th>
                  {displayCols.map((c) => (
                    <th key={c} className="px-1.5 py-1 text-left font-medium">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {excelData.map((row, i) => {
                  const active = i === previewRowIdx && editingRowIdx >= 0;
                  const customized = !!rowOverrides[i] && Object.keys(rowOverrides[i]).length > 0;
                  return (
                    <tr
                      key={i}
                      onClick={() => selectPreviewRow(i)}
                      className={`cursor-pointer border-t border-line ${
                        active ? 'bg-brand-50' : customized ? 'bg-amber-50/40' : 'hover:bg-surface-subtle'
                      }`}
                    >
                      <td className="px-1.5 py-1 text-ink-faint">{i + 1}</td>
                      {displayCols.map((c) => (
                        <td key={c} className="px-1.5 py-1 text-ink">
                          {row[c] || '-'}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <ColumnChips source="individual" />
        </div>
      )}
    </Section>
  );
}
