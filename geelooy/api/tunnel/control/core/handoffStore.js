// B"H
const slots = new Map();

function now() {
  return Date.now();
}

function publicPayload(value) {
  try { return JSON.stringify(value, null, 2); }
  catch (_) { return JSON.stringify({ ok: false, error: "handoff_json_failed" }, null, 2); }
}

/**
 * B"H
 * Stores the latest tunnel result behind one stable per-tunnel handoff gate.
 * The Awtsmoos lets the visible URL remain still while the inner river changes.
 *
 * @param {string} tunnelName Stable tunnel/session name.
 * @param {object} entry Latest result envelope.
 * @returns {object} Stored handoff slot.
 */
function publishHandoff(tunnelName, entry = {}) {
  const key = String(tunnelName || "").trim();
  if (!key) return null;

  const previous = slots.get(key);
  const version = previous ? previous.version + 1 : 1;
  const slot = {
    ok: true,
    kind: "awtsmoos-tunnel-handoff",
    tunnelName: key,
    version,
    updatedAt: now(),
    action: entry.action || "",
    result: entry.result || null
  };

  slots.set(key, slot);
  return slot;
}

function getHandoff(tunnelName) {
  return slots.get(String(tunnelName || "").trim()) || null;
}

module.exports = { publishHandoff, getHandoff, publicPayload };
