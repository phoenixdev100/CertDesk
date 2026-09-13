import { Type, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import Section from '../ui/Section';
import ColorField from '../ui/ColorField';
import FontPicker from './FontPicker';
import { useCertStore } from '../../store/useCertStore';
import { useToast } from '../ui/Toast';

const ALIGN_ICONS = { left: AlignLeft, center: AlignCenter, right: AlignRight };

export default function TypographyPanel() {
  const activeFieldIdx = useCertStore((s) => s.activeFieldIdx);
  const fields = useCertStore((s) => s.fields);
  const updateActiveFieldTypography = useCertStore((s) => s.updateActiveFieldTypography);
  const overrideActiveFieldTypography = useCertStore((s) => s.overrideActiveFieldTypography);
  const editingRowIdx = useCertStore((s) => s.editingRowIdx);
  const toast = useToast();

  const field = activeFieldIdx >= 0 ? fields[activeFieldIdx] : null;

  const update = (patch) => {
    if (!field) return;
    if (editingRowIdx >= 0) overrideActiveFieldTypography(patch);
    else updateActiveFieldTypography(patch);
  };

  const setAlign = (align) => update({ align });
  const setTransform = (textTransform) => update({ textTransform });

  return (
    <Section
      icon={<Type size={13} />}
      title="Typography"
      badge={
        <span className="text-2xs text-ink-faint">
          {field ? field.key : 'no field selected'}
        </span>
      }
    >
      <div className="mb-2">
        <label className="label">Font Family</label>
        <FontPicker />
      </div>

      <div className="mb-2 flex gap-2">
        <div className="flex-1">
          <label className="label">Size (px)</label>
          <input
            type="number"
            min={10}
            max={300}
            step={2}
            value={field?.size ?? 72}
            onChange={(e) => update({ size: parseInt(e.target.value, 10) || 72 })}
            className="input"
            disabled={!field}
          />
        </div>
        <div className="flex-1">
          <label className="label">Color</label>
          <ColorField
            color={field?.color ?? '#2c1a0e'}
            hex={field?.color ?? '#2c1a0e'}
            onColor={(v) => update({ color: v })}
            onHex={(v) => {
              if (/^#[0-9a-fA-F]{6}$/.test(v)) update({ color: v });
            }}
          />
        </div>
      </div>

      <div className="mb-2 flex gap-2">
        <div className="flex-1">
          <label className="label">Style</label>
          <div className="flex gap-1">
            <button
              onClick={() => update({ bold: !field?.bold })}
              disabled={!field}
              className={`btn h-7 w-7 p-0 ${field?.bold ? 'bg-brand-600 border-brand-600 text-white' : ''}`}
            >
              <Bold size={12} />
            </button>
            <button
              onClick={() => update({ italic: !field?.italic })}
              disabled={!field}
              className={`btn h-7 w-7 p-0 ${field?.italic ? 'bg-brand-600 border-brand-600 text-white' : ''}`}
            >
              <Italic size={12} />
            </button>
            <button
              onClick={() => update({ underline: !field?.underline })}
              disabled={!field}
              className={`btn h-7 w-7 p-0 ${field?.underline ? 'bg-brand-600 border-brand-600 text-white' : ''}`}
            >
              <Underline size={12} />
            </button>
          </div>
        </div>
        <div className="flex-1">
          <label className="label">Alignment</label>
          <div className="flex gap-1">
            {['left', 'center', 'right'].map((a) => {
              const Icon = ALIGN_ICONS[a];
              return (
                <button
                  key={a}
                  onClick={() => setAlign(a)}
                  disabled={!field}
                  className={`btn h-7 w-7 p-0 ${field?.align === a ? 'bg-brand-600 border-brand-600 text-white' : ''}`}
                >
                  <Icon size={12} />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div>
        <label className="label">Text Transform</label>
        <div className="flex gap-1">
          {[
            { v: 'none', label: 'Aa' },
            { v: 'uppercase', label: 'AA' },
            { v: 'titlecase', label: 'Ab' },
          ].map((t) => (
            <button
              key={t.v}
              onClick={() => setTransform(t.v)}
              disabled={!field}
              className={`btn flex-1 ${field?.textTransform === t.v ? 'bg-brand-600 border-brand-600 text-white' : ''}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
    </Section>
  );
}
