//B"H
const MAX_EVENTS = 1000;
const events = [];

/**
 * B"H — The browser memory scribes what it is allowed to see.
 *
 * The mirrored page remains the real actor, but localStorage, sessionStorage,
 * URL changes, and IndexedDB openings leave small non-secret footprints here so
 * the Node relay can understand the browser session without reading cookies or
 * dumping private database contents.
 */
function recordClientState(event = {}) {
  const clean = sanitize(event);
  events.push({ ...clean, at: Date.now() });
  while (events.length > MAX_EVENTS) events.shift();
  return clean;
}

function clientStateSummary() {
  const byType = {};
  for (const event of events) byType[event.type || "unknown"] = (byType[event.type || "unknown"] || 0) + 1;
  return { ok: true, total: events.length, byType, recent: events.slice(-40) };
}

function sanitize(event) {
  const out = {};
  for (const [key, value] of Object.entries(event || {})) {
    if (/token|secret|password|authorization|cookie/i.test(key)) continue;
    if (typeof value === "string") out[key] = value.slice(0, 600);
    else if (typeof value === "number" || typeof value === "boolean" || value == null) out[key] = value;
    else out[key] = JSON.stringify(value).slice(0, 600);
  }
  return out;
}

module.exports = { recordClientState, clientStateSummary };
