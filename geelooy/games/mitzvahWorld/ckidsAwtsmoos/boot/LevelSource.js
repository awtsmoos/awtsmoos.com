// B"H
/**
 * @file LevelSource.js
 * @description
 * Chapter 46: The boot loader points to the true ladder gate.
 *
 * Purpose:
 * Converts a local URL `path` into an allow-listed level vessel.
 *
 * Runtime owner:
 * `ckidsAwtsmoos/ikar.js` calls this during mobile and desktop autoload.
 *
 * Inputs:
 * A query-string path such as `village`, `village.json`, or `ladder-1.json`.
 *
 * Outputs:
 * A safe local filename under `levels/ladder/data`.
 *
 * Performance:
 * Pure string normalization only. No fetches or filesystem-like probing happen
 * before the allow-list accepts the id.
 *
 * Fallback rules:
 * Missing ids skip autoload. Unsafe ids throw loudly instead of falling through
 * to a guessed remote or arbitrary local path.
 *
 * Diagnostics:
 * The caller records the raw path and normalized id in boot phases.
 *
 * Why it exists:
 * Browser proofs and profiler scripts use `?path=village`; the runtime data file
 * is `village.json`. Both names must resolve to the same local vessel without
 * weakening the allow-list.
 */
const LADDER_MAX = 20;
const JSON_RE = /\.json$/i;
const JS_RE = /\.js$/i;
const EXT_RE = /\.(?:js|json)$/i;

function allowedNames() {
  const names = new Set(["village.json", "village.js"]);
  for (let i = 1; i <= LADDER_MAX; i += 1) {
    names.add(`ladder-${i}.json`);
    names.add(`ladder-${i}.js`);
  }
  return names;
}

function withDefaultExtension(clean) {
  if (!clean) return clean;
  if (EXT_RE.test(clean)) return clean;
  if (clean === "village" || /^ladder-\d+$/.test(clean)) return `${clean}.json`;
  return clean;
}

export function normalizeLevelId(raw) {
  const rawText = String(raw ?? "").trim();
  if (!rawText) return null;
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(rawText) || rawText.includes("\\")) throw new Error("Only village and ladder-N local level paths are enabled here.");
  const clean = withDefaultExtension(rawText.split(/[?#]/)[0].split("/").pop().toLowerCase());
  if (!allowedNames().has(clean)) throw new Error("Only village and ladder-N local level paths are enabled here.");
  return clean;
}

function levelUrl(id, seal) {
  return new URL(`../../levels/ladder/data/${id}?bh=${seal}`, import.meta.url);
}

function validate(id, data) {
  if (data?.format !== "awtsmoos-level-json-v1" || !data?.nivrayim) throw new Error(`Invalid level vessel: ${id}`);
  return data;
}

export async function loadLevelData(id, seal, markPhase) {
  if (!id) throw new Error("Missing level id.");
  if (JS_RE.test(id)) return loadJsLevel(id, seal, markPhase);
  return loadJsonLevel(id.replace(JS_RE, ".json"), seal, markPhase);
}

async function loadJsonLevel(id, seal, markPhase) {
  const url = levelUrl(id, seal);
  markPhase("level:json:fetch:start", { id, url: url.href });
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`JSON level fetch failed: ${id} (${response.status})`);
  const data = validate(id, await response.json());
  markPhase("level:json:fetch:done", { id, nivraTypes: Object.keys(data.nivrayim).length });
  return data;
}

async function loadJsLevel(id, seal, markPhase) {
  const url = levelUrl(id, seal);
  markPhase("level:js:import:start", { id, url: url.href });
  const module = await import(url.href);
  const data = validate(id, typeof module.default === "function" ? await module.default() : module.default);
  markPhase("level:js:import:done", { id, nivraTypes: Object.keys(data.nivrayim).length });
  return data;
}

export function jsonSourcePath(id) {
  return String(id || "").replace(JS_RE, ".json").replace(JSON_RE, ".json");
}
