"use client";

import { useMemo, useState } from "react";
import type { SensorTelemetry } from "@/lib/types";

const LIMIT = 100;

function formatTime(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString();
}

export default function TelemetryTable({ rows }: { rows: SensorTelemetry[] }) {
  const [type, setType] = useState("all");
  const [query, setQuery] = useState("");

  const types = useMemo(() => Array.from(new Set(rows.map((r) => r.sensorType))).sort(), [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows
      .filter((r) => type === "all" || r.sensorType === type)
      .filter(
        (r) => !q || r.gatewayId.toLowerCase().includes(q) || r.sensorId.toLowerCase().includes(q),
      )
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [rows, type, query]);

  return (
    <section>
      <div className="toolbar">
        <label>
          <span className="sr-only">Search by gateway or sensor ID</span>
          <input
            type="search"
            placeholder="Search gateway or sensor ID"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <label>
          <span className="sr-only">Sensor type</span>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="all">All sensor types</option>
            {types.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <span className="muted count">
          {filtered.length} reading{filtered.length === 1 ? "" : "s"}
        </span>
      </div>

      {filtered.length === 0 ? (
        <p className="empty">
          {rows.length === 0
            ? "No readings yet. Use the Send data tab to post a gateway payload."
            : "No readings match these filters."}
        </p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Gateway</th>
                <th>Sensor type</th>
                <th>Sensor ID</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, LIMIT).map((r) => (
                <tr key={r.id}>
                  <td>{formatTime(r.timestamp)}</td>
                  <td>{r.gatewayId}</td>
                  <td>{r.sensorType}</td>
                  <td className="mono">{r.sensorId}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length > LIMIT ? (
            <p className="muted table-note">Showing the latest {LIMIT} of {filtered.length}.</p>
          ) : null}
        </div>
      )}
    </section>
  );
}
