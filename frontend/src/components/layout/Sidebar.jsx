import { PanelLeftClose } from 'lucide-react';
import ExcelImport from '../sidebar/ExcelImport';
import TypographyPanel from '../sidebar/TypographyPanel';
import ShadowPanel from '../sidebar/ShadowPanel';
import FieldPosition from '../sidebar/FieldPosition';

export default function Sidebar({ smtpConfig, emailSubject, emailBodyHtml, onOpenSmtp, onOpenCompose, onCollapse }) {
  return (
    <aside className="flex h-full w-72 flex-col overflow-y-auto border-r border-line bg-surface">
      <div className="flex justify-end border-b border-line px-2 py-1">
        <button
          onClick={onCollapse}
          className="text-ink-faint transition-colors hover:text-ink"
          title="Collapse panel"
        >
          <PanelLeftClose size={14} />
        </button>
      </div>
      <ExcelImport />
      <TypographyPanel />
      <ShadowPanel />
      <FieldPosition />
    </aside>
  );
}
