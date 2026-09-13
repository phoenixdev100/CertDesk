import { Droplet } from 'lucide-react';
import Section from '../ui/Section';
import ColorField from '../ui/ColorField';
import { useCertStore } from '../../store/useCertStore';

export default function ShadowPanel() {
  const activeFieldIdx = useCertStore((s) => s.activeFieldIdx);
  const fields = useCertStore((s) => s.fields);
  const updateActiveFieldTypography = useCertStore((s) => s.updateActiveFieldTypography);
  const overrideActiveFieldTypography = useCertStore((s) => s.overrideActiveFieldTypography);
  const editingRowIdx = useCertStore((s) => s.editingRowIdx);

  const field = activeFieldIdx >= 0 ? fields[activeFieldIdx] : null;

  const update = (patch) => {
    if (!field) return;
    if (editingRowIdx >= 0) overrideActiveFieldTypography(patch);
    else updateActiveFieldTypography(patch);
  };

  return (
    <Section icon={<Droplet size={13} />} title="Text Shadow">
      <label className="mb-2 flex items-center gap-2 text-xs text-ink-muted">
        <input
          type="checkbox"
          checked={!!field?.shadowEnabled}
          onChange={(e) => update({ shadowEnabled: e.target.checked })}
          disabled={!field}
          className="accent-brand-600"
        />
        Enable shadow
      </label>

      {field?.shadowEnabled && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="label">Shadow Color</label>
              <ColorField
                color={field.shadowColor}
                hex={field.shadowColor}
                onColor={(v) => update({ shadowColor: v })}
                onHex={(v) => {
                  if (/^#[0-9a-fA-F]{6}$/.test(v)) update({ shadowColor: v });
                }}
              />
            </div>
            <div className="flex-1">
              <label className="label">Blur (px)</label>
              <input
                type="number"
                min={0}
                max={60}
                value={field.shadowBlur}
                onChange={(e) => update({ shadowBlur: parseInt(e.target.value, 10) || 0 })}
                className="input"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="label">Offset X</label>
              <input
                type="number"
                min={-40}
                max={40}
                value={field.shadowOffsetX}
                onChange={(e) => update({ shadowOffsetX: parseInt(e.target.value, 10) || 0 })}
                className="input"
              />
            </div>
            <div className="flex-1">
              <label className="label">Offset Y</label>
              <input
                type="number"
                min={-40}
                max={40}
                value={field.shadowOffsetY}
                onChange={(e) => update({ shadowOffsetY: parseInt(e.target.value, 10) || 0 })}
                className="input"
              />
            </div>
          </div>
          <div>
            <label className="label">Shadow Opacity</label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={100}
                value={field.shadowOpacity}
                onChange={(e) => update({ shadowOpacity: parseInt(e.target.value, 10) })}
                className="flex-1 accent-brand-600"
              />
              <span className="w-9 text-2xs text-ink-muted">{field.shadowOpacity}%</span>
            </div>
          </div>
        </div>
      )}
    </Section>
  );
}
