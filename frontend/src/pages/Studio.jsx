import { useEffect, useState, useRef } from 'react';
import { Upload, Trash2, PanelLeft, PanelRight } from 'lucide-react';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import TeamPanel from '../components/layout/TeamPanel';
import CertificateCanvas from '../components/canvas/CertificateCanvas';
import CertDropZone from '../components/canvas/CertDropZone';
import ZoomControls from '../components/canvas/ZoomControls';
import RowIndicator from '../components/canvas/RowIndicator';
import ExportMenu from '../components/canvas/ExportMenu';
import SmtpModal from '../components/modals/SmtpModal';
import ComposeModal from '../components/modals/ComposeModal';
import { useToast } from '../components/ui/Toast';
import { useCertStore } from '../store/useCertStore';
import {
  loadSmtpConfig,
  saveSmtpConfig,
  loadDraft,
  saveDraft,
} from '../lib/storage';
import { loadCertificateFile } from '../lib/certificateLoader';
import {
  saveWorkspace,
  loadWorkspace,
  saveImage,
  loadImage,
  clearImage as clearPersistedImage,
} from '../lib/persistence';
import { ZOOM_STEPS } from '../constants';

export default function Studio() {
  const image = useCertStore((s) => s.image);
  const naturalW = useCertStore((s) => s.naturalW);
  const naturalH = useCertStore((s) => s.naturalH);
  const setZoom = useCertStore((s) => s.setZoom);
  const setImage = useCertStore((s) => s.setImage);
  const clearImage = useCertStore((s) => s.clearImage);
  const teamMode = useCertStore((s) => s.teamMode);
  const toast = useToast();
  const restoredRef = useRef(false);

  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);

  const [smtpOpen, setSmtpOpen] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [smtpConfig, setSmtpConfig] = useState(() => loadSmtpConfig());
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBodyHtml, setEmailBodyHtml] = useState('');

  // ── Block Ctrl+A / select-all on the app (except in editable fields) ──
  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        const tag = e.target?.tagName;
        if (tag !== 'INPUT' && tag !== 'TEXTAREA' && !e.target?.isContentEditable) {
          e.preventDefault();
        }
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  // ── Restore persisted state on mount ──
  useEffect(() => {
    (async () => {
      const draft = loadDraft();
      if (draft) {
        setEmailSubject(draft.subject || '');
        setEmailBodyHtml(draft.bodyHtml || '');
      }

      const ws = loadWorkspace();
      if (ws) {
        const store = useCertStore.getState();
        if (ws.fields) {
          useCertStore.setState({
            fields: ws.fields.map((f) => ({ ...f, _bbox: null })),
            activeFieldIdx: ws.activeFieldIdx ?? -1,
          });
        }
        if (ws.excelData && ws.excelColumns) {
          store.setExcelData(ws.excelData, ws.excelColumns);
        }
        if (ws.rowOverrides) {
          useCertStore.setState({ rowOverrides: ws.rowOverrides });
        }
        if (ws.previewRowIdx != null) {
          useCertStore.setState({ previewRowIdx: ws.previewRowIdx });
        }
        if (ws.teamPreviewRowIdx != null) {
          useCertStore.setState({ teamPreviewRowIdx: ws.teamPreviewRowIdx });
        }
        if (ws.teamMode) {
          useCertStore.setState({ teamMode: ws.teamMode });
        }
        if (ws.teams) {
          useCertStore.setState({ teams: ws.teams });
        }
        if (ws.teamKey) {
          useCertStore.setState({ teamKey: ws.teamKey });
        }
        if (ws.teamData) {
          useCertStore.setState({ teamData: ws.teamData });
        }
        if (ws.teamColumns) {
          useCertStore.setState({ teamColumns: ws.teamColumns });
        }
      }

      const dataUrl = await loadImage();
      if (dataUrl) {
        const img = new Image();
        img.onload = () => {
          setImage(img);
          if (ws?.zoomIdx != null) {
            setZoom(ws.zoomIdx, ZOOM_STEPS[ws.zoomIdx]);
          }
          restoredRef.current = true;
        };
        img.src = dataUrl;
      } else {
        restoredRef.current = true;
      }
    })();
  }, []);

  // ── Auto-save workspace state on changes (debounced) ──
  useEffect(() => {
    if (!restoredRef.current) return;
    const timer = setTimeout(() => {
      saveWorkspace(useCertStore.getState());
    }, 500);
    return () => clearTimeout(timer);
  }, [
    useCertStore((s) => s.fields),
    useCertStore((s) => s.excelData),
    useCertStore((s) => s.excelColumns),
    useCertStore((s) => s.rowOverrides),
    useCertStore((s) => s.zoomIdx),
    useCertStore((s) => s.activeFieldIdx),
    useCertStore((s) => s.previewRowIdx),
    useCertStore((s) => s.teamPreviewRowIdx),
    useCertStore((s) => s.teamMode),
    useCertStore((s) => s.teams),
    useCertStore((s) => s.teamKey),
    useCertStore((s) => s.teamData),
    useCertStore((s) => s.teamColumns),
  ]);

  // ── Persist image to IndexedDB when it changes ──
  useEffect(() => {
    if (!restoredRef.current) return;
    if (image) saveImage(image);
  }, [image]);

  // Auto-fit zoom when a NEW image loads
  useEffect(() => {
    if (!naturalW || !naturalH) return;
    if (restoredRef.current && !useCertStore.getState().zoomIdx) return;
    const wrap = document.getElementById('canvas-wrap');
    const availW = (wrap?.clientWidth || 800) - 48;
    const availH = (wrap?.clientHeight || 600) - 100;
    const bestScale = Math.min(availW / naturalW, availH / naturalH, 1.0);
    let idx = 0;
    for (let i = 0; i < ZOOM_STEPS.length; i++) {
      if (ZOOM_STEPS[i] <= bestScale) idx = i;
    }
    setZoom(idx, ZOOM_STEPS[idx]);
  }, [naturalW, naturalH, setZoom]);

  const handleSaveSmtp = (cfg) => {
    setSmtpConfig(cfg);
    saveSmtpConfig(cfg);
  };

  const handleSubjectChange = (v) => {
    setEmailSubject(v);
    saveDraft({ subject: v, bodyHtml: emailBodyHtml });
  };

  const handleBodyChange = (v) => {
    setEmailBodyHtml(v);
    saveDraft({ subject: emailSubject, bodyHtml: v });
  };

  return (
    <div className="flex h-screen flex-col select-none animate-fade-in">
      <Header onOpenExport={() => setExportOpen(true)} />
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar - always mounted, animates width/opacity */}
        <div
          className="h-full overflow-hidden transition-all duration-300 ease-out"
          style={{ width: leftCollapsed ? '0px' : '18rem', opacity: leftCollapsed ? 0 : 1 }}
        >
          <Sidebar
            smtpConfig={smtpConfig}
            emailSubject={emailSubject}
            emailBodyHtml={emailBodyHtml}
            onOpenSmtp={() => setSmtpOpen(true)}
            onOpenCompose={() => setComposeOpen(true)}
            onCollapse={() => setLeftCollapsed(true)}
          />
        </div>

        {leftCollapsed && (
          <button
            onClick={() => setLeftCollapsed(false)}
            className="flex items-center justify-center border-r border-line bg-surface px-2 text-ink-faint transition-colors hover:bg-surface-subtle hover:text-ink"
            title="Expand left panel"
          >
            <PanelLeft size={14} />
          </button>
        )}

        <main id="canvas-wrap" className="relative flex flex-1 items-center justify-center overflow-auto bg-surface-muted p-6">
          {image ? (
            <>
              <CertificateCanvas />
              <RowIndicator />
              <ZoomControls />
              <button
                onClick={() => document.getElementById('cert-file-change')?.click()}
                className="absolute left-3 top-3 flex items-center gap-1.5 rounded-md border border-line bg-surface px-2.5 py-1.5 text-2xs font-medium text-ink-muted shadow-card hover:bg-surface-subtle"
              >
                <Upload size={11} /> Change Certificate
              </button>
              <button
                onClick={() => {
                  clearImage();
                  clearPersistedImage();
                  toast('Certificate cleared', 'success');
                }}
                className="absolute right-3 top-3 flex items-center gap-1.5 rounded-md border border-line bg-surface px-2.5 py-1.5 text-2xs font-medium text-rose-600 shadow-card hover:bg-rose-50 hover:border-rose-200"
              >
                <Trash2 size={11} /> Clear Certificate
              </button>
              <input
                id="cert-file-change"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif,application/pdf"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  try {
                    const { image: img, width, height } = await loadCertificateFile(file);
                    setImage(img);
                    toast(`Certificate loaded - ${width}×${height}px`, 'success');
                  } catch (err) {
                    toast(err.message || 'Could not load file', 'warning');
                  }
                  e.target.value = '';
                }}
              />
            </>
          ) : (
            <CertDropZone />
          )}
        </main>

        {rightCollapsed && (
          <button
            onClick={() => setRightCollapsed(false)}
            className="flex items-center justify-center border-l border-line bg-surface px-2 text-ink-faint transition-colors hover:bg-surface-subtle hover:text-ink"
            title="Expand right panel"
          >
            <PanelRight size={14} />
          </button>
        )}

        {/* Right sidebar - always mounted, animates width/opacity */}
        <div
          className="h-full overflow-hidden transition-all duration-300 ease-out"
          style={{ width: rightCollapsed ? '0px' : '18rem', opacity: rightCollapsed ? 0 : 1 }}
        >
          <TeamPanel
            onCollapse={() => setRightCollapsed(true)}
          />
        </div>
      </div>

      <SmtpModal
        open={smtpOpen}
        onClose={() => setSmtpOpen(false)}
        config={smtpConfig}
        onSave={handleSaveSmtp}
      />
      <ComposeModal
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        subject={emailSubject}
        onSubjectChange={handleSubjectChange}
        bodyHtml={emailBodyHtml}
        onBodyChange={handleBodyChange}
      />
      <ExportMenu open={exportOpen} onClose={() => setExportOpen(false)} />
    </div>
  );
}
