// Segmented level indicator (10 segments), like a battery or fuel gauge.
export type Level = "ok" | "warn" | "alert";

export function levelFor(percent: number, warnBelow: number, alertBelow: number): Level {
  if (percent < alertBelow) return "alert";
  if (percent < warnBelow) return "warn";
  return "ok";
}

export default function LevelBar({
  percent,
  level,
  label,
}: {
  percent: number;
  level: Level;
  label: string;
}) {
  const clamped = Math.max(0, Math.min(100, percent));
  const lit = Math.round(clamped / 10);
  return (
    <div
      className={`level level-${level}`}
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
    >
      {Array.from({ length: 10 }, (_, i) => (
        <span key={i} className={i < lit ? "seg on" : "seg"} />
      ))}
    </div>
  );
}
