import type { Battery, Generator, Rectifier } from "@/lib/types";
import LevelBar, { levelFor, type Level } from "./LevelBar";

function Panel({
  level,
  title,
  badge,
  subtitle,
  children,
}: {
  level: Level;
  title: string;
  badge: string;
  subtitle?: string | null;
  children: React.ReactNode;
}) {
  return (
    <article className={`panel panel-${level}`}>
      <header className="panel-head">
        <div>
          <h3>{title}</h3>
          {subtitle ? <p className="muted">{subtitle}</p> : null}
        </div>
        <span className={`badge badge-${level}`}>{badge}</span>
      </header>
      {children}
    </article>
  );
}

function Stat({ label, value, unit }: { label: string; value: string | number; unit?: string }) {
  return (
    <div className="stat">
      <dt>{label}</dt>
      <dd>
        {value}
        {unit ? <span className="unit">{unit}</span> : null}
      </dd>
    </div>
  );
}

const shortId = (id: string) => id.slice(0, 8);

export function BatteryPanel({ b }: { b: Battery }) {
  const level = levelFor(b.stateOfCharge, 30, 15);
  const badge = level === "alert" ? "Critical" : level === "warn" ? "Low" : "Healthy";
  return (
    <Panel level={level} title={b.model} badge={badge} subtitle={b.description || `ID ${shortId(b.id)}`}>
      <div className="gauge">
        <LevelBar percent={b.stateOfCharge} level={level} label="State of charge" />
        <span className="gauge-value">{b.stateOfCharge}%</span>
      </div>
      <dl className="stats">
        <Stat label="Voltage" value={b.voltage} unit="V" />
        <Stat label="Current" value={b.current} unit="A" />
        <Stat label="Capacity" value={b.capacity} unit="Ah" />
      </dl>
    </Panel>
  );
}

export function GeneratorPanel({ g }: { g: Generator }) {
  const fuelPct = g.tankSize > 0 ? Math.round((g.fuelLevel / g.tankSize) * 100) : 0;
  const fuelLevel = levelFor(fuelPct, 25, 10);
  const level: Level = fuelLevel;
  return (
    <Panel level={level} title={g.model} badge={g.status} subtitle={g.description || `ID ${shortId(g.id)}`}>
      <div className="gauge">
        <LevelBar percent={fuelPct} level={fuelLevel} label="Fuel level" />
        <span className="gauge-value">{fuelPct}%</span>
      </div>
      <dl className="stats">
        <Stat label="Voltage" value={g.voltage} unit="V" />
        <Stat label="Fuel" value={g.fuelLevel} unit="L" />
        <Stat label="Tank" value={g.tankSize} unit="L" />
      </dl>
    </Panel>
  );
}

export function RectifierPanel({ r }: { r: Rectifier }) {
  const level: Level = r.gridActive ? "ok" : "warn";
  return (
    <Panel
      level={level}
      title={r.model}
      badge={r.gridActive ? "Grid on" : "Grid off"}
      subtitle={r.description || `ID ${shortId(r.id)}`}
    >
      <dl className="stats">
        <Stat label="Voltage" value={r.voltage} unit="V" />
        <Stat label="Current" value={r.current} unit="A" />
        <Stat label="Low-voltage disconnect" value={r.lowVoltageDisconnect} unit="V" />
      </dl>
    </Panel>
  );
}
