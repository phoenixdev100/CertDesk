import { useRef, useState } from 'react';
import { ImagePlus } from 'lucide-react';
import { useCertStore } from '../../store/useCertStore';
import { useToast } from '../ui/Toast';
import { loadCertificateFile } from '../../lib/certificateLoader';

const ACCEPT = 'image/png,image/jpeg,image/webp,image/gif,application/pdf';

export default function CertDropZone() {
  const fileRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const setImage = useCertStore((s) => s.setImage);
  const toast = useToast();

  const loadFile = async (file) => {
    setLoading(true);
    try {
      const { image, width, height } = await loadCertificateFile(file);
      setImage(image);
      toast(`Certificate loaded - ${width}×${height}px`, 'success');
    } catch (err) {
      toast(err.message || 'Could not load file', 'warning');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex flex-1 items-center justify-center p-6"
      onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
      onDragLeave={() => setDragActive(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragActive(false);
        loadFile(e.dataTransfer.files[0]);
      }}
    >
      <input
        ref={fileRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          loadFile(e.target.files[0]);
          e.target.value = '';
        }}
      />
      <div
        onClick={(e) => {
          e.stopPropagation();
          fileRef.current?.click();
        }}
        className={`flex w-full max-w-sm cursor-pointer flex-col items-center gap-3 rounded-lg border-2 border-dashed px-6 py-12 text-center transition-colors ${
          dragActive ? 'border-brand-500 bg-brand-50' : 'border-line-strong bg-surface'
        }`}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-subtle text-ink-faint">
          <ImagePlus size={26} />
        </div>
        <div>
          <div className="text-sm font-medium text-ink">
            {loading ? 'Loading…' : 'Drop your certificate here'}
          </div>
          <div className="mt-1 text-2xs text-ink-faint">Drag & drop or click to browse</div>
          <div className="mt-2 text-2xs font-medium text-ink-muted">PNG · JPG · WebP · PDF</div>
        </div>
      </div>
    </div>
  );
}
