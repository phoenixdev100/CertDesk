import ExcelImport from '../sidebar/ExcelImport';
import ColumnChips from '../sidebar/ColumnChips';
import TypographyPanel from '../sidebar/TypographyPanel';
import ShadowPanel from '../sidebar/ShadowPanel';
import FieldPosition from '../sidebar/FieldPosition';
import DownloadPanel from '../sidebar/DownloadPanel';
import EmailPanel from '../sidebar/EmailPanel';

export default function Sidebar({ smtpConfig, emailSubject, emailBodyHtml, onOpenSmtp, onOpenCompose }) {
  return (
    <aside className="flex w-72 flex-col overflow-y-auto border-r border-line bg-surface">
      <ExcelImport />
      <ColumnChips />
      <TypographyPanel />
      <ShadowPanel />
      <FieldPosition />
      <DownloadPanel />
      <EmailPanel
        smtpConfig={smtpConfig}
        emailSubject={emailSubject}
        emailBodyHtml={emailBodyHtml}
        onOpenSmtp={onOpenSmtp}
        onOpenCompose={onOpenCompose}
      />
    </aside>
  );
}
