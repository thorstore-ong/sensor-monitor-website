"use client";

import { useState } from "react";
import { postTelemetry } from "@/lib/api";

function samplePayload() {
  const now = new Date().toISOString();
  return JSON.stringify(
    {
      gateway: "gateway-001",
      timestamp: now,
      sensors: [
        {
          sensorType: "Battery",
          sensorId: "battery-01",
          sensorData: {
            Id: crypto.randomUUID(),
            Voltage: 48,
            Model: "BatteryX 100",
            Description: "Main bank",
            Current: 12,
            StateOfCharge: 82,
            Capacity: 200,
          },
        },
        {
          sensorType: "Generator",
          sensorId: "generator-01",
          sensorData: {
            Id: crypto.randomUUID(),
            Voltage: 230,
            Model: "GenSet 20",
            Status: "Running",
            FuelLevel: 140,
            TankSize: 200,
          },
        },
        {
          sensorType: "Rectifier",
          sensorId: "rectifier-01",
          sensorData: {
            Id: crypto.randomUUID(),
            Voltage: 54,
            Model: "Rect 3000",
            Current: 30,
            LowVoltageDisconnect: 42,
            GridActive: true,
          },
        },
      ],
    },
    null,
    2,
  );
}

function describeError(status: number, body: unknown): string {
  if (typeof body === "string" && body.trim())
    return `The API returned ${status}: ${body}`;
  if (body && typeof body === "object") {
    const b = body as {
      error?: unknown;
      title?: unknown;
      errors?: Record<string, string[]>;
    };
    if (b.error) return String(b.error);
    if (b.errors) {
      const details = Object.entries(b.errors)
        .map(([field, msgs]) => `${field}: ${msgs.join(", ")}`)
        .join("; ");
      return `${b.title ?? `The API returned ${status}`} ${details}`;
    }
    if (b.title) return String(b.title);
  }
  return `The API returned ${status}.`;
}

export default function SendTelemetry({ onSent }: { onSent: () => void }) {
  const [text, setText] = useState(samplePayload);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(
    null,
  );

  async function send() {
    let payload: unknown;
    try {
      payload = JSON.parse(text);
    } catch {
      setResult({
        ok: false,
        message: "This isn't valid JSON. Check for a missing comma or bracket.",
      });
      return;
    }
    setSending(true);
    setResult(null);
    try {
      const res = await postTelemetry(payload);
      if (res.ok) {
        const count = Array.isArray(res.body) ? res.body.length : 0;
        setResult({
          ok: true,
          message: `Sent. The API accepted ${count} sensor reading${count === 1 ? "" : "s"}.`,
        });
        // The API writes to the database on a background queue, so give it a moment.
        setTimeout(onSent, 800);
      } else {
        setResult({ ok: false, message: describeError(res.status, res.body) });
      }
    } catch (e) {
      setResult({
        ok: false,
        message:
          e instanceof Error
            ? `Couldn't reach the API: ${e.message}`
            : "Couldn't reach the API.",
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="send">
      <p className="muted">
        Post a gateway payload to the API. Each sensor needs a{" "}
        <code>sensorType</code> of Battery, Generator or Rectifier, and{" "}
        <code>sensorData</code> with an <code>id</code> GUID.
      </p>
      <label className="sr-only" htmlFor="payload">
        Gateway payload (JSON)
      </label>
      <textarea
        id="payload"
        value={text}
        onChange={(e) => setText(e.target.value)}
        spellCheck={false}
        rows={24}
      />
      <div className="actions">
        <button className="primary" onClick={send} disabled={sending}>
          {sending ? "Sending…" : "Send payload"}
        </button>
        <button onClick={() => setText(samplePayload())} disabled={sending}>
          Reset sample
        </button>
      </div>
      {result ? (
        <p
          className={result.ok ? "notice notice-ok" : "notice notice-error"}
          role="status"
        >
          {result.message}
        </p>
      ) : null}
    </section>
  );
}
