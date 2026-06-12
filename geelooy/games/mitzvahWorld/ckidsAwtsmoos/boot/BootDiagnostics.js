// B"H
/**
 * @file BootDiagnostics.js
 * @description
 * Chapter 20: The Awtsmoos records each boot breath.
 * Tiny shared diagnostics keep `ikar.js` small while preserving the detailed
 * error panel that reveals every failed vessel honestly.
 */
const scope = window;

export function markPhase(seal, phase, data = {}) {
  scope.__AWTSMOOS_IKAR_PHASES__ ||= [];
  const row = { phase, at: new Date().toISOString(), seal, ...data };
  scope.__AWTSMOOS_IKAR_PHASES__.push(row);
  if (scope.__AWTSMOOS_BOOT_TRACE__ === true) console.info("B\"H | IKAR_PHASE", JSON.stringify(row));
  return row;
}

export function safeClone(value, depth = 0) {
  if (depth > 4) return "[MaxDepth]";
  if (value == null || ["string", "number", "boolean"].includes(typeof value)) return value;
  if (value instanceof Error) return { name: value.name, message: value.message, stack: value.stack, cause: safeClone(value.cause, depth + 1) };
  if (Array.isArray(value)) return value.map(item => safeClone(item, depth + 1));
  if (typeof value !== "object") return String(value);
  const out = { kind: value?.constructor?.name || "Object", string: String(value) };
  for (const key of Object.keys(value).slice(0, 80)) out[key] = safeClone(value[key], depth + 1);
  return out;
}

export function reportError(error, context = {}) {
  const details = { context: safeClone(context), thrown: safeClone(error), phases: scope.__AWTSMOOS_IKAR_PHASES__ || [], at: new Date().toISOString() };
  scope.__AWTSMOOS_LAST_ERROR__ = details;
  scope.__AWTSMOOS_LAST_ERROR_JSON__ = JSON.stringify(details, null, 2);
  console.error(`B"H - ${context.label || "Runtime error"} JSON`, scope.__AWTSMOOS_LAST_ERROR_JSON__);
  const root = document.getElementById("ikar") || document.body;
  let panel = document.getElementById("awtsmoosBootErrorPanel");
  if (!panel) {
    panel = document.createElement("pre");
    panel.id = "awtsmoosBootErrorPanel";
    panel.style.cssText = "position:fixed;inset:12px;z-index:999999;padding:16px;overflow:auto;white-space:pre-wrap;background:#190000;color:#ffd7a0;border:2px solid #ff6b2a;font:13px/1.4 monospace;";
    root.appendChild(panel);
  }
  panel.textContent = `B\"H — Mitzvah World boot error\n\n${scope.__AWTSMOOS_LAST_ERROR_JSON__}`;
}
