import { useState, useEffect, useRef } from 'react';
import { Download, Package, Eye, ChevronDown, X } from 'lucide-react';
import Button from '../ui/Button';
import ProgressBar from '../ui/ProgressBar';
import { useCertStore } from '../../store/useCertStore';
import { useToast } from '../ui/Toast';
import { exportCertificate, exportCertificatesZip } from '../../lib/exporter';
import { safeName, triggerDownload } from '../../lib/utils';

const FORMATS = [
  { value: 'png', label: 'PNG' },
  { value: 'pdf', label: 'PDF' },
  { value: 'jpeg', label: 'JPEG' },
];

function FormatSelect({ value, onChange, id }) {
  const [open, setOpen] = useState(false);
  const selected = FORMATS.find((f) => f.value === value) || FORMATS[0];
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  return (
    <div ref={containerRef} className="relative w-20">
      <button
        id={id}
        onClick={() => setOpen((v) => !v)}
        className="input flex w-20 items-center justify-between text-2xs font-medium"
      >
        <span>{selected.label}</span>
        <ChevronDown size={11} className={`text-ink-faint transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-10 mt-1 w-20 overflow-hidden rounded-md border border-line bg-surface shadow-lg">
          {FORMATS.map((f) => (
            <button
              key={f.value}
              onClick={() => { onChange(f.value); setOpen(false); }}
              className={`flex w-full items-center justify-between px-2.5 py-1.5 text-left text-2xs transition-colors ${
                f.value === value
                  ? 'bg-brand-50 text-brand-700 font-medium'
                  : 'text-ink hover:bg-surface-subtle'
              }`}
            >
              {f.label}
              {f.value === value && <span className="text-brand-600">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ExportMenu({ open, onClose }) {
  const [progress, setProgress] = useState(null);
  const [busy, setBusy] = useState(false);
  const [previewFormat, setPreviewFormat] = useState('pdf');
  const [exportFormat, setExportFormat] = useState('pdf');
  const [bulkFormat, setBulkFormat] = useState('pdf');
  const [exportRowIdx, setExportRowIdx] = useState(0);
  const [showCancel, setShowCancel] = useState(false);
  const toast = useToast();
  const panelRef = useRef(null);
  const abortControllerRef = useRef(null);

  const image = useCertStore((s) => s.image);
  const fields = useCertStore((s) => s.fields);
  const excelData = useCertStore((s) => s.excelData);
  const excelColumns = useCertStore((s) => s.excelColumns);
  const teamData = useCertStore((s) => s.teamData);
  const teamColumns = useCertStore((s) => s.teamColumns);
  const teams = useCertStore((s) => s.teams);
  const previewRowIdx = useCertStore((s) => (s.teams.length > 0 ? s.teamPreviewRowIdx : s.previewRowIdx));
  const rowOverrides = useCertStore((s) => s.rowOverrides);

  const activeData = teams.length > 0 ? teamData : excelData;
  const activeColumns = teams.length > 0 ? teamColumns : excelColumns;
  const canBulk = activeData.length > 0 && fields.length > 0;
  const canExport = image && fields.length > 0;
  const nameKey = activeColumns.find((k) => k.includes('name')) || activeColumns[0];
  const totalRows = activeData.length;

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setProgress(null);
      setBusy(false);
      setShowCancel(false);
      setExportRowIdx(0);
      abortControllerRef.current = null;
    }
  }, [open]);

  const handleClose = () => {
    if (busy) {
      setShowCancel(true);
    } else {
      onClose();
    }
  };

  const confirmCancel = () => {
    abortControllerRef.current?.abort('Export cancelled by user');
    setBusy(false);
    setProgress(null);
    setShowCancel(false);
    onClose();
  };

  // Close on Escape - but confirm if export is in progress
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, busy]);

  if (!open) return null;

  const downloadPreview = async () => {
    if (!image) return toast('Load a certificate template first', 'warning');
    setBusy(true);
    try {
      const rowData = activeData[previewRowIdx] || {};
      const { blob, ext } = await exportCertificate(image, fields, rowData, previewRowIdx, rowOverrides, previewFormat);
      const label = nameKey && rowData[nameKey] ? safeName(rowData[nameKey]) : 'preview';
      triggerDownload(blob, `${label}_certificate.${ext}`);
      toast(`Preview downloaded as ${previewFormat.toUpperCase()}`, 'success');
    } catch (err) {
      toast(err.message || 'Export failed', 'warning');
    } finally {
      setBusy(false);
    }
  };

  const downloadSingle = async () => {
    if (!image) return toast('Load a certificate template first', 'warning');
    if (!fields.length) return toast('Place at least one field on the canvas first', 'warning');
    if (!activeData.length) return toast('Import Excel data to select a recipient', 'warning');
    setBusy(true);
    try {
      const rowIdx = Math.min(exportRowIdx, activeData.length - 1);
      const rowData = activeData[rowIdx];
      const { blob, ext } = await exportCertificate(image, fields, rowData, rowIdx, rowOverrides, exportFormat);
      const label = nameKey && rowData[nameKey] ? safeName(rowData[nameKey]) : `row_${rowIdx + 1}`;
      triggerDownload(blob, `${label}_certificate.${ext}`);
      toast(`Certificate exported as ${exportFormat.toUpperCase()}`, 'success');
    } catch (err) {
      toast(err.message || 'Export failed', 'warning');
    } finally {
      setBusy(false);
    }
  };

  const downloadBulk = async () => {
    if (!activeData.length) return toast('Upload an Excel file first', 'warning');
    if (!fields.length) return toast('Place at least one field on the canvas first', 'warning');
    setBusy(true);
    setProgress(0);
    const controller = new AbortController();
    abortControllerRef.current = controller;
    try {
      const zipBlob = await exportCertificatesZip(image, fields, activeData, rowOverrides, bulkFormat, (p) => {
        setProgress(p);
      }, controller.signal);
      triggerDownload(zipBlob, `certificates_${bulkFormat}.zip`);
      toast(`${activeData.length} certificate(s) exported as ${bulkFormat.toUpperCase()} ZIP`, 'success');
      onClose();
    } catch (err) {
      if (err.message === 'Export cancelled') {
        toast('Export cancelled', 'warning');
      } else {
        toast(err.message || 'Bulk export failed', 'warning');
      }
    } finally {
      setBusy(false);
      setProgress(null);
      abortControllerRef.current = null;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
    >
      <div
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
        className="w-96 animate-fade-in rounded-lg border border-line bg-surface shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <span className="flex items-center gap-2 text-sm font-semibold text-ink">
            <Download size={15} /> Export Certificates
          </span>
          <button
            onClick={handleClose}
            className="text-ink-faint transition-colors hover:text-ink"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4 p-4">
          {/* 1. Preview */}
          <div>
            <label className="label">Preview (current view)</label>
            <div className="flex gap-1.5">
              <Button variant="outline" className="flex-1" disabled={busy || !image} onClick={downloadPreview}>
                <Eye size={12} /> Download
              </Button>
              <div className="w-20">
                <FormatSelect value={previewFormat} onChange={setPreviewFormat} id="fmt-preview" />
              </div>
            </div>
          </div>

          {/* 2. Single export */}
          <div>
            <label className="label">Export certificate</label>
            {activeData.length > 0 ? (
              <div className="space-y-1.5">
                <select
                  value={exportRowIdx}
                  onChange={(e) => setExportRowIdx(parseInt(e.target.value, 10))}
                  className="input cursor-pointer text-2xs"
                >
                  {activeData.map((row, i) => (
                    <option key={i} value={i}>
                      {i + 1}. {row[nameKey] || `Row ${i + 1}`} {row.email ? `(${row.email})` : ''}
                    </option>
                  ))}
                </select>
                <div className="flex gap-1.5">
                  <Button variant="outline" className="flex-1" disabled={busy || !canExport} onClick={downloadSingle}>
                    <Download size={12} /> Export
                  </Button>
                  <div className="w-20">
                    <FormatSelect value={exportFormat} onChange={setExportFormat} id="fmt-export" />
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-2xs text-ink-faint">Import Excel data to select a recipient</p>
            )}
          </div>

          {/* 3. Bulk export */}
          <div>
            <label className="label">Bulk export as ZIP</label>
            <div className="flex gap-1.5">
              <Button variant="success" className="flex-1" disabled={busy || !canBulk} onClick={downloadBulk}>
                <Package size={12} /> {busy && progress != null && progress < 100 ? 'Generating…' : 'Export All'}
              </Button>
              <div className="w-20">
                <FormatSelect value={bulkFormat} onChange={setBulkFormat} id="fmt-bulk" />
              </div>
            </div>
          </div>

          {progress != null && (
            <ProgressBar
              value={progress}
              label={progress < 100 ? `Generating ${progress}%` : 'Compressing ZIP…'}
            />
          )}

          {totalRows > 0 && (
            <p className="border-t border-line pt-2 text-center text-2xs text-ink-faint">
              {totalRows} certificate{totalRows !== 1 ? 's' : ''} ready
              {teams.length > 0 ? ` · ${teams.length} team${teams.length !== 1 ? 's' : ''}` : ''}
            </p>
          )}
        </div>
      </div>

      {showCancel && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/20" onClick={() => setShowCancel(false)} />
          <div className="relative w-80 rounded-lg border border-line bg-surface p-4 shadow-xl">
            <h3 className="mb-2 text-sm font-semibold text-ink">Cancel Export?</h3>
            <p className="mb-4 text-2xs text-ink-muted">
              An export is currently in progress. Are you sure you want to cancel it?
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCancel(false)}>No, Continue</Button>
              <Button variant="danger" onClick={confirmCancel}>Yes, Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
