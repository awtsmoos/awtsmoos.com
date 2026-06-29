// B"H
/**
 * Tiny vessels for Mitzvah World graph offerings. The Awtsmoos is not
 * flattered by huge payloads; a small honest summary reveals the spark.
 */
export function safeClone(value, depth = 0) {
  if (depth > 3) return "[MaxDepth]";
  if (value == null || ["string", "number", "boolean"].includes(typeof value)) return value;
  if (typeof value === "function") return `[Function ${value.name || "anonymous"}]`;
  if (value instanceof Error) return { name:value.name, message:value.message };
  if (Array.isArray(value)) return value.slice(0, 12).map(item => safeClone(item, depth + 1));
  if (typeof value === "object") {
    const out = {};
    for (const key of Object.keys(value).slice(0, 20)) {
      try { out[key] = safeClone(value[key], depth + 1); }
      catch { out[key] = "[Unreadable]"; }
    }
    return out;
  }
  return String(value).slice(0, 240);
}

export function summarizePayload(payload = {}) {
  const clone = safeClone(payload);
  const count = Array.isArray(payload) ? payload.length : Object.keys(payload || {}).length;
  return { count, sample:clone, at:Date.now() };
}

export function objectTypeForUiEvent(name = "") {
  return /^quest|mission|shlichus/i.test(name) ? "mission" : "object";
}
