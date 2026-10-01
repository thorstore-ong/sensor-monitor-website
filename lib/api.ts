import type {
  Battery,
  Generator,
  Rectifier,
  SensorTelemetry,
  Snapshot,
} from "./types";

// Requests go to Next.js, which rewrites /proxy/* to the API (see next.config.mjs).
const BASE = "/proxy";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`${path} returned ${res.status} ${res.statusText}`);
  return (await res.json()) as T;
}

export async function fetchSnapshot(): Promise<Snapshot> {
  const [telemetry, batteries, generators, rectifiers] = await Promise.all([
    get<SensorTelemetry[]>("/sensors"),
    get<Battery[]>("/sensors/batteries"),
    get<Generator[]>("/sensors/generators"),
    get<Rectifier[]>("/sensors/rectifiers"),
  ]);
  return { telemetry, batteries, generators, rectifiers };
}

// The repo's controller class is spelled "TemeletryController", so its route is
// /api/Temeletry. A corrected spelling gives /api/Telemetry, so try both.
const POST_PATHS = ["/api/Temeletry", "/api/Telemetry"];

export async function postTelemetry(
  payload: unknown,
): Promise<{ ok: boolean; status: number; body: unknown }> {
  let last: { ok: boolean; status: number; body: unknown } = { ok: false, status: 404, body: null };
  for (const path of POST_PATHS) {
    const res = await fetch(`${BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const text = await res.text();
    let body: unknown = text;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      /* keep raw text */
    }
    last = { ok: res.ok, status: res.status, body };
    if (res.status !== 404) return last; // route exists (success or a real API error)
  }
  return last;
}