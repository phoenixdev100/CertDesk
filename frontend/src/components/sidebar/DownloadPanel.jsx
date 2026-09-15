import { useState } from 'react';
import { Download, Package, Eye, ChevronDown } from 'lucide-react';
import Section from '../ui/Section';
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
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input cursor-pointer appearance-none pr-7 text-2xs font-medium"
      >
        {FORMATS.map((f) => (
          <option key={f.value} value={f.value}>{f.label}</option>
        ))}
      </select>
      <ChevronDown size={11} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-ink-faint" />
    </div>
  );
}

export default function DownloadPanel() {
  const [progress, setProgress] = useState(null);
  const [busy, setBusy] = useState(false);
  const [previewFormat, setPreviewFormat] = useState('pdf');
  const [exportFormat, setExportFormat] = useState('pdf');
  const [bulkFormat, setBulkFormat] = useState('pdf');
  const [exportRowIdx, setExportRowIdx] = useState(0);
  const toast = useToast();

  const image = useCertStore((s) => s.image);
  const fields = useCertStore((s) => s.fields);
  const excelData = useCertStore((s) => s.excelData);
  const excelColumns = useCertStore((s) => s.excelColumns);
  const teamData = useCertStore((s) => s.teamData);
  const teamColumns = useCertStore((s) => s.teamColumns);
  const teams = useCertStore((s) => s.teams);
  const previewRowIdx = useCertStore((s) => s.previewRowIdx);
  const rowOverrides = useCertStore((s) => s.rowOverrides);

  // Use team data if teams exist, else individual data
  const activeData = teams.length > 0 ? teamData : excelData;
  const activeColumns = teams.length > 0 ? teamColumns : excelColumns;

  const canBulk = activeData.length > 0 && fields.length > 0;
  const canExport = image && fields.length > 0;
  const nameKey = activeColumns.find((k) => k.includes('name')) || activeColumns[0];

  // 1. Preview - downloads what's currently shown on the canvas (no Excel needed)
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

  // 2. Export - pick any row from the dropdown and download in chosen format
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

  // 3. Bulk export as ZIP - all rows in chosen format
  const downloadBulk = async () => {
    if (!activeData.length) return toast('Upload an Excel file first', 'warning');
    if (!fields.length) return toast('Place at least one field on the canvas first', 'warning');
    setBusy(true);
    setProgress(0);
    try {
      const zipBlob = await exportCertificatesZip(image, fields, activeData, rowOverrides, bulkFormat, (p) => {
        setProgress(p);
      });
      triggerDownload(zipBlob, `certificates_${bulkFormat}.zip`);
      toast(`${activeData.length} certificate(s) exported as ${bulkFormat.toUpperCase()} ZIP`, 'success');
    } catch (err) {
      toast(err.message || 'Bulk export failed', 'warning');
    } finally {
      setBusy(false);
      setProgress(100);
      setTimeout(() => setProgress(null), 1500);
    }
  };

  return (
    <Section icon={<Download size={13} />} title="Download">
      <div className="space-y-2.5">
        {/* 1. Preview - downloads what's on the canvas now */}
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

        {/* 2. Export - pick a specific recipient */}
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

        {/* 3. Bulk export as ZIP */}
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
      </div>
    </Section>
  );
}
