// B"H
/** @file safeClone.js @description Small bounded clone for UI state and diagnostics. */
export function safeClone(value, depth = 0) {
  if (depth > 3) return "[MaxDepth]";
  if (value == null || ["string", "number", "boolean"].includes(typeof value)) return value;
  if (typeof value === "function") return `[Function ${value.name || "anonymous"}]`;
  if (value instanceof Error) return { name:value.name, message:value.message, stack:String(value.stack || "").slice(0, 2000) };
  if (Array.isArray(value)) return value.slice(0, 24).map(item => safeClone(item, depth + 1));
  if (typeof value !== "object") return String(value).slice(0, 500);
  const out = {};
  for (const key of Object.keys(value).slice(0, 40)) {
    try { out[key] = safeClone(value[key], depth + 1); } catch { out[key] = "[Unreadable]"; }
  }
  return out;
}
