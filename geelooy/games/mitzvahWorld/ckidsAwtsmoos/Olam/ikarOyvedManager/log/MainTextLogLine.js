// B"H
/**
 * @file MainTextLogLine.js
 * @description
 * Chapter 4: Text logs no longer ask THREE.Texture to serialize itself.
 *
 * JSON.stringify calls object `toJSON()` methods, and THREE.Texture warns when
 * it is asked to serialize without metadata. The console noise came from log
 * formatting, not gameplay. This formatter walks plain data safely and replaces
 * scene/mesh/material/texture vessels with compact labels.
 */

/** @returns {boolean} True for heavy graphical vessels. */
function isGraphicsVessel(value) {
  return !!(
    value &&
    typeof value === "object" &&
    (
      value.isTexture ||
      value.isMaterial ||
      value.isObject3D ||
      value.isBufferGeometry ||
      value.isMesh ||
      value.isScene
    )
  );
}

/** @returns {string} Compact label for a heavy graphical vessel. */
function graphicsLabel(value) {
  const type = value.type || value.constructor?.name || "ThreeObject";
  const name = value.name ? `:${value.name}` : "";
  return `[${type}${name}]`;
}

/** Safely converts any log field into plain serializable data. */
function plain(value, seen = new WeakSet(), depth = 0) {
  if (value === null || value === undefined) return value;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return value;
  if (typeof value === "function") return `[Function:${value.name || "anonymous"}]`;
  if (value instanceof Error) return `${value.name}: ${value.message}`;
  if (isGraphicsVessel(value)) return graphicsLabel(value);
  if (typeof value !== "object") return String(value);
  if (seen.has(value)) return "[Circular]";
  if (depth > 3) return "[DepthLimit]";

  seen.add(value);
  if (Array.isArray(value)) return value.slice(0, 12).map(item => plain(item, seen, depth + 1));

  const out = {};
  for (const [key, child] of Object.entries(value).slice(0, 24)) {
    out[key] = plain(child, seen, depth + 1);
  }
  return out;
}

/** Flattens a value into one log-safe line. */
export function mainLogValue(value) {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (value instanceof Error) return `${value.name}: ${value.message}`;
  if (typeof value === "string") return value.replace(/\s+/g, " ").trim();
  try {
    return JSON.stringify(plain(value)).replace(/\s+/g, " ").trim();
  } catch {
    return String(value);
  }
}

/** Creates a main-thread log line. */
export function makeMainTextLine(level, channel, message, fields = {}) {
  const parts = [`B"H`, new Date().toISOString(), level.toUpperCase(), channel, message];
  for (const [key, value] of Object.entries(fields)) parts.push(`${key}=${mainLogValue(value)}`);
  return parts.join(" | ");
}
