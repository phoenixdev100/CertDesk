import { useRef, useState, useEffect } from 'react';
import { Users, Upload, Trash2, PanelRightClose } from 'lucide-react';
import Section from '../ui/Section';
import Button from '../ui/Button';
import { useCertStore } from '../../store/useCertStore';
import { parseExcelFile } from '../../hooks/useExcelImport';
import { useToast } from '../ui/Toast';
import ColumnChips from '../sidebar/ColumnChips';

export default function TeamPanel({ onCollapse }) {
  const fileRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState('');
  const [globalCount, setGlobalCount] = useState(1);
  const [soloName, setSoloName] = useState('');
  const [soloCount, setSoloCount] = useState(1);
  const toast = useToast();

  const teams = useCertStore((s) => s.teams);
  const teamKey = useCertStore((s) => s.teamKey);
  const setTeamsFromExcel = useCertStore((s) => s.setTeamsFromExcel);
  const expandTeams = useCertStore((s) => s.expandTeams);
  const updateTeamCount = useCertStore((s) => s.updateTeamCount);
  const setAllTeamCounts = useCertStore((s) => s.setAllTeamCounts);
  const removeTeam = useCertStore((s) => s.removeTeam);
  const addTeam = useCertStore((s) => s.addTeam);
  const clearTeams = useCertStore((s) => s.clearTeams);
  const selectTeamPreviewRow = useCertStore((s) => s.selectTeamPreviewRow);
  const teamPreviewRowIdx = useCertStore((s) => s.teamPreviewRowIdx);

  // Auto-expand teams whenever teams change
  useEffect(() => {
    if (teams.length > 0) {
      expandTeams();
    }
  }, [teams, expandTeams]);

  const handleFile = async (file) => {
    if (!file) return;
    try {
      const { excelData: parsed, columns } = await parseExcelFile(file);
      setTeamsFromExcel(parsed, columns);
      setFileName(`${file.name} (${parsed.length} teams)`);
      toast(`Loaded ${parsed.length} teams`, 'success');
    } catch (err) {
      toast(err.message || 'Failed to parse file', 'warning');
    }
  };

  const handleClear = () => {
    clearTeams();
    setFileName('');
    toast('Teams cleared', 'success');
  };

  const handleApplyGlobalCount = () => {
    if (teams.length === 0) return;
    setAllTeamCounts(globalCount);
    toast(`All teams set to ${globalCount} certificates`, 'success');
  };

  const handleAddSolo = () => {
    const name = soloName.trim();
    if (!name) return toast('Enter a team name', 'warning');
    addTeam(name, soloCount);
    setSoloName('');
    setSoloCount(1);
    toast(`Added ${name} × ${soloCount}`, 'success');
  };

  const totalCerts = teams.reduce((sum, t) => sum + t.count, 0);

  return (
    <aside className="flex h-full w-72 flex-col overflow-y-auto border-l border-line bg-surface">
      <div className="shrink-0 flex justify-start border-b border-line px-2 py-1">
        <button
          onClick={onCollapse}
          className="text-ink-faint transition-colors hover:text-ink"
          title="Collapse panel"
        >
          <PanelRightClose size={14} />
        </button>
      </div>
      <Section
        icon={<Users size={13} />}
        title="Team Mode"
        badge={teams.length ? <span className="chip">{teams.length} teams · {totalCerts} certs</span> : null}
      >
        {/* Upload */}
        <div className="mb-2">
          <label className="label">Upload team names (.xlsx / .csv)</label>
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

        {/* Solo / Manual team add */}
        <div className="mb-2">
          <label className="label">Or add a team manually</label>
          <div className="flex gap-1.5">
              <input
                type="text"
                placeholder="Team name"
                value={soloName}
                onChange={(e) => setSoloName(e.target.value)}
                className="input flex-1 text-2xs"
              />
              <input
                type="number"
                min="1"
                value={soloCount}
                onChange={(e) => setSoloCount(parseInt(e.target.value, 10) || 1)}
                className="input w-14 text-center text-2xs"
              />
              <Button variant="primary" className="h-full" onClick={handleAddSolo}>
                Add
              </Button>
            </div>
          </div>

        {/* Global count setter */}
        {teams.length > 0 && (
          <div className="mb-2 rounded-md border border-line bg-surface-subtle p-2">
            <label className="label">Set count for all teams</label>
            <div className="flex gap-1.5">
              <input
                type="number"
                min="1"
                value={globalCount}
                onChange={(e) => setGlobalCount(parseInt(e.target.value, 10) || 1)}
                className="input flex-1 text-2xs"
              />
              <Button variant="primary" className="h-full" onClick={handleApplyGlobalCount}>
                Apply to All
              </Button>
            </div>
          </div>
        )}

        {/* Team list with editable counts */}
        {teams.length > 0 && (
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-2xs font-medium text-ink-muted">
                {teams.length} teams · {totalCerts} certificates total
              </span>
              <Button variant="danger" onClick={handleClear}>
                <Trash2 size={11} /> Clear
              </Button>
            </div>
            <div className="max-h-64 overflow-auto rounded-md border border-line">
              <table className="w-full text-2xs">
                <thead className="sticky top-0 bg-surface-subtle text-ink-muted">
                  <tr>
                    <th className="px-1.5 py-1 text-left font-medium">#</th>
                    <th className="px-1.5 py-1 text-left font-medium">Team</th>
                    <th className="px-1.5 py-1 text-center font-medium">Count</th>
                    <th className="px-1.5 py-1"></th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map((team, i) => {
                  const startIdx = teams.slice(0, i).reduce((sum, t) => sum + t.count, 0);
                  const active = teamPreviewRowIdx >= startIdx && teamPreviewRowIdx < startIdx + team.count;
                  return (
                    <tr
                      key={i}
                      onClick={() => selectTeamPreviewRow(startIdx)}
                      className={`cursor-pointer border-t border-line ${active ? 'bg-brand-50' : 'hover:bg-surface-subtle'}`}
                    >
                      <td className="px-1.5 py-1 text-ink-faint">{i + 1}</td>
                      <td className="px-1.5 py-1 text-ink">{team.name}</td>
                      <td className="px-1.5 py-1 text-center">
                        <input
                          type="number"
                          min="1"
                          value={team.count}
                          onChange={(e) => updateTeamCount(i, e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-12 rounded border border-line px-1 py-0.5 text-center text-2xs focus:border-brand-500 focus:outline-none"
                        />
                      </td>
                      <td className="px-1 py-1 text-center">
                        <button
                          onClick={(e) => { e.stopPropagation(); removeTeam(i); }}
                          className="text-ink-faint transition-colors hover:text-red-600"
                        >
                          <Trash2 size={11} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                </tbody>
              </table>
            </div>
            <ColumnChips source="team" />
          </div>
        )}
      </Section>
    </aside>
  );
}
