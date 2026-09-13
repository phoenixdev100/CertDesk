export default function ColorField({ color, hex, onColor, onHex }) {
  return (
    <div className="flex items-center gap-1.5">
      <input
        type="color"
        value={color}
        onChange={(e) => onColor(e.target.value)}
        className="h-7 w-9 cursor-pointer rounded border border-line bg-surface p-0.5"
      />
      <input
        type="text"
        value={hex}
        onChange={(e) => {
          const v = e.target.value;
          onHex(v);
          if (/^#[0-9a-fA-F]{6}$/.test(v)) onColor(v);
        }}
        placeholder="#hex"
        maxLength={7}
        className="input w-20 font-mono"
      />
    </div>
  );
}
