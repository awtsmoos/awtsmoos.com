//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Layer 14 — correction telemetry for the Airtight CSS Guarantee System.
 *
 * Pure logic, fully testable, no browser needed. The browser firewall
 * (layer4/styleFirewall.js) records its corrections on
 * `window.__tunnelCssFirewall.corrections`; a separate collector (out of
 * scope here) feeds those records into `recordCorrections`.
 *
 * Each correction is `{timestamp, selector, type, property, oldValue, newValue}`.
 */

import { appendFileSync } from "node:fs";

/** In-memory ring buffer cap — bounded so a runaway page can't grow memory. */
export const TELEMETRY_RING_CAP = 500;

/** Default log path; overridden by CSS_TELEMETRY_LOG. */
export const DEFAULT_TELEMETRY_LOG = "/tmp/css-guarantee-telemetry.log";

const ring = [];

function normalizeCorrection(correction) {
  if (!correction || typeof correction !== "object") return null;
  return {
    timestamp: correction.timestamp ?? Date.now(),
    selector: correction.selector ?? null,
    type: correction.type ?? "unknown",
    property: correction.property ?? null,
    oldValue: correction.oldValue ?? null,
    newValue: correction.newValue ?? null,
  };
}

/**
 * Record corrections: append to the in-memory ring buffer (cap 500) AND
 * append JSON lines to the log file (CSS_TELEMETRY_LOG or default).
 * Telemetry failures never throw — the tunnel must keep working.
 * @param {object|object[]} corrections
 * @returns {number} current ring size
 */
export function recordCorrections(corrections) {
  const list = Array.isArray(corrections) ? corrections : [corrections];
  const logPath = process.env.CSS_TELEMETRY_LOG || DEFAULT_TELEMETRY_LOG;
  for (const item of list) {
    const record = normalizeCorrection(item);
    if (!record) continue;
    ring.push(record);
    if (ring.length > TELEMETRY_RING_CAP) {
      ring.splice(0, ring.length - TELEMETRY_RING_CAP);
    }
    try {
      appendFileSync(logPath, JSON.stringify(record) + "\n", "utf8");
    } catch {
      // Telemetry is advisory; a dead log path must never break the pipeline.
    }
  }
  return ring.length;
}

/**
 * Stats computed from the ring buffer.
 * @returns {{total:number, byType:Record<string,number>, lastHour:number}}
 */
export function getStats() {
  const now = Date.now();
  const byType = {};
  let lastHour = 0;
  for (const record of ring) {
    byType[record.type] = (byType[record.type] || 0) + 1;
    if (typeof record.timestamp === "number" && now - record.timestamp < 3600_000) {
      lastHour++;
    }
  }
  return { total: ring.length, byType, lastHour };
}

/**
 * True when corrections spiked in the last hour — a sign the firewall is
 * fighting the CSS and a rollback should be considered.
 * Threshold: getStats().lastHour > CSS_ROLLBACK_THRESHOLD (default 10).
 */
export function shouldRollback() {
  const raw = Number(process.env.CSS_ROLLBACK_THRESHOLD);
  const threshold = Number.isFinite(raw) && raw >= 0 ? raw : 10;
  return getStats().lastHour > threshold;
}

/**
 * Test-only helper: clear the ring buffer so tests are deterministic.
 */
export function resetTelemetry() {
  ring.length = 0;
}
