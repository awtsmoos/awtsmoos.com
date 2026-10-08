//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file CSS Guarantee System — feature flags.
 *
 * Opt-in via environment variables. Fail-open is the default: unless the
 * operator explicitly asks for fail-closed behavior, findings are reported
 * and the deploy keeps moving.
 *
 *   CSS_GUARANTEE_MODE   "fail-open" (default) | "fail-closed"
 *   CSS_GUARANTEE_LAYERS "1,2,3,4" (default) — comma-separated layer numbers
 */

/** Valid deploy-mode values. */
export const MODES = Object.freeze(["fail-open", "fail-closed"]);

/**
 * Read the deploy mode from the environment.
 * @returns {"fail-open"|"fail-closed"}
 */
export function getMode() {
  const raw = String(process.env.CSS_GUARANTEE_MODE ?? "").trim().toLowerCase();
  return raw === "fail-closed" ? "fail-closed" : "fail-open";
}

/** True only when the operator explicitly opted into fail-closed. */
export function isFailClosed() {
  return getMode() === "fail-closed";
}

/**
 * Parse the enabled layers from the environment.
 * @returns {number[]} e.g. [1,2,3,4]; falls back to all layers on garbage.
 */
export function getEnabledLayers() {
  const raw = String(process.env.CSS_GUARANTEE_LAYERS ?? "").trim();
  if (!raw) return [1, 2, 3, 4, 15];
  const parsed = raw
    .split(",")
    .map((part) => Number(part.trim()))
    .filter((n) => Number.isInteger(n) && n >= 1 && (n <= 4 || n === 15));
  const deduped = [];
  for (const n of parsed) {
    if (!deduped.includes(n)) deduped.push(n);
  }
  return deduped.length > 0 ? deduped : [1, 2, 3, 4];
}
