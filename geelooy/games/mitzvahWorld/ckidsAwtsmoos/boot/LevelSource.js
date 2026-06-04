// B"H
/**
 * @file LevelSource.js
 * @description
 * Chapter 46: The boot loader points to the true ladder gate.
 * Because this file lives under `ckidsAwtsmoos/boot`, level URLs must climb two
 * directories to `mitzvahWorld/levels`. JSON and JS level vessels are both safe,
 * local, allow-listed, and validated before the world begins.
 */
const LADDER_MAX = 20;
const JSON_RE = /\.json$/i;
const JS_RE = /\.js$/i;

function allowedNames() {
  const names = new Set(["village.json", "village.js"]);
  for (let i = 1; i <= LADDER_MAX; i += 1) {
    names.add(`ladder-${i}.json`);
    names.add(`ladder-${i}.js`);
  }
  return names;
}

export function normalizeLevelId(raw) {
  const rawText = String(raw ?? "").trim();
  if (!rawText) return null;
  const clean = rawText.split(/[?#]/)[0].split("/").pop().toLowerCase();
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
