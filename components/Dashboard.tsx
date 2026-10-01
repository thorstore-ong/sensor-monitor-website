"use client";

import { useState } from "react";
import { fetchSnapshot } from "@/lib/api";
import { usePolling } from "@/lib/usePolling";
import { BatteryPanel, GeneratorPanel, RectifierPanel } from "./SensorPanels";
import TelemetryTable from "./TelemetryTable";
import SendTelemetry from "./SendTelemetry";

type Tab = "readings" | "batteries" | "generators" | "rectifiers" | "send";

const REFRESH_OPTIONS = [
  { label: "Off", value: 0 },
  { label: "5 s", value: 5000 },
  { label: "15 s", value: 15000 },
  { label: "60 s", value: 60000 },
];

export default function Dashboard() {
  const [tab, setTab] = useState<Tab>("readings");
  const [interval, setIntervalMs] = useState(15000);
  const { data, error, loading, updatedAt, refresh } = usePolling(fetchSnapshot, interval || null);

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "readings", label: "Readings", count: data?.telemetry.length },
    { id: "batteries", label: "Batteries", count: data?.batteries.length },
    { id: "generators", label: "Generators", count: data?.generators.length },
    { id: "rectifiers", label: "Rectifiers", count: data?.rectifiers.length },
    { id: "send", label: "Send data" },
  ];

  const status = error ? "offline" : loading ? "connecting" : "online";

  return (
    <div className="shell">
      <header className="topbar">
        <div className="title">
          <h1>Sensor Monitor</h1>
          <p className="muted">Site power: batteries, generators and rectifiers</p>
        </div>
        <div className="controls">
          <span className={`conn conn-${status}`}>
            <span className="dot" aria-hidden />
            {status === "online" ? "API connected" : status === "offline" ? "API unreachable" : "Connecting"}
          </span>
          <label className="refresh">
            Refresh
            <select value={interval} onChange={(e) => setIntervalMs(Number(e.target.value))}>
              {REFRESH_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <button onClick={() => void refresh()}>Refresh now</button>
        </div>
      </header>

      <nav className="tabs" role="tablist" aria-label="Sensor views">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            className={tab === t.id ? "tab active" : "tab"}
            onClick={() => setTab(t.id)}
          >
            {t.label}
            {t.count !== undefined ? <span className="tab-count">{t.count}</span> : null}
          </button>
        ))}
      </nav>

      {error ? (
        <div className="notice notice-error" role="alert">
          <strong>Can&apos;t load data.</strong> {error}. Check that the SensorMonitor API is running and that{" "}
          <code>SENSOR_API_URL</code> points to it.
        </div>
      ) : null}

      <main>
        {tab === "send" ? (
          <SendTelemetry onSent={() => void refresh()} />
        ) : loading && !data ? (
          <p className="empty">Loading sensors…</p>
        ) : !data ? null : tab === "readings" ? (
          <TelemetryTable rows={data.telemetry} />
        ) : tab === "batteries" ? (
          data.batteries.length ? (
            <div className="grid">{data.batteries.map((b, i) => <BatteryPanel key={`${b.id}-${i}`} b={b} />)}</div>
          ) : (
            <p className="empty">No battery data yet. Send a payload with a Battery sensor.</p>
          )
        ) : tab === "generators" ? (
          data.generators.length ? (
            <div className="grid">{data.generators.map((g, i) => <GeneratorPanel key={`${g.id}-${i}`} g={g} />)}</div>
          ) : (
            <p className="empty">No generator data yet. Send a payload with a Generator sensor.</p>
          )
        ) : data.rectifiers.length ? (
          <div className="grid">{data.rectifiers.map((r, i) => <RectifierPanel key={`${r.id}-${i}`} r={r} />)}</div>
        ) : (
          <p className="empty">No rectifier data yet. Send a payload with a Rectifier sensor.</p>
        )}
      </main>

      <footer className="foot muted">
        {updatedAt ? `Last updated ${updatedAt.toLocaleTimeString()}` : "Not updated yet"}
      </footer>
    </div>
  );
}
