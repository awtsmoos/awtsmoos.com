// B"H
/** B"H: tiny YAML emitter for simulation summaries without adding deps. */
function toYaml(value, indent = 0) {
  const pad = " ".repeat(indent);
  if (value == null) return "null";
  if (typeof value !== "object") return scalar(value);
  if (Array.isArray(value)) return value.map(v => pad + "- " + nested(v, indent + 2)).join("\n");
  return Object.entries(value).map(([k, v]) => pad + safeKey(k) + ": " + nested(v, indent + 2)).join("\n");
}
function nested(value, indent) {
  return value && typeof value === "object" ? "\n" + toYaml(value, indent) : scalar(value);
}
function scalar(value) {
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return JSON.stringify(String(value));
}
function safeKey(key) { return /^[A-Za-z0-9_-]+$/.test(key) ? key : JSON.stringify(key); }
module.exports = { toYaml };
