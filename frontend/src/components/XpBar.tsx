interface Props {
  ratio: number;
  label?: string;
  showPct?: boolean;
}

export function XpBar({ ratio, label, showPct }: Props) {
  const pct = Math.max(0, Math.min(1, ratio));
  return (
    <div>
      {label && (
        <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
          <span>{label}</span>
          {showPct && <span>{Math.round(pct * 100)}%</span>}
        </div>
      )}
      <div className="xp-bar">
        <span style={{ width: `${pct * 100}%` }} />
      </div>
    </div>
  );
}
