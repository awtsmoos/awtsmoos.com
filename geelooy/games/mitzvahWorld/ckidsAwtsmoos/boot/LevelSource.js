// B"H
/**
 * @file LevelSource.js
 * @description
 * Chapter 47: A heavy meadow is folded into a side chamber, while a tiny green
 * proving ground opens in front of the player.
 *
 * `village` now means the performance test vessel. The prior meadow remains one
 * breath away as `village-meadow`. The Awtsmoos lets a single alias decide which
 * world descends into the browser, without deleting either world.
 */
const LADDER_MAX = 20;
const JSON_RE = /\.json$/i;
const JS_RE = /\.js$/i;
const EXT_RE = /\.(?:js|json)$/i;

function allowedNames() {
  const names = new Set(["village.json", "village.js", "village-meadow.json", "village-meadow.js"]);
  for (let i = 1; i <= LADDER_MAX; i += 1) {
    names.add(`ladder-${i}.json`);
    names.add(`ladder-${i}.js`);
  }
  return names;
}

function withDefaultExtension(clean) {
  if (!clean) return clean;
  if (EXT_RE.test(clean)) return clean;
  if (clean === "village" || clean === "village-meadow" || /^ladder-\d+$/.test(clean)) return `${clean}.json`;
  return clean;
}

export function normalizeLevelId(raw) {
  const rawText = String(raw ?? "").trim();
  if (!rawText) return null;
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(rawText) || rawText.includes("\\")) throw new Error("Only village, village-meadow, and ladder-N local level paths are enabled here.");
  const clean = withDefaultExtension(rawText.split(/[?#]/)[0].split("/").pop().toLowerCase());
  if (!allowedNames().has(clean)) throw new Error("Only village, village-meadow, and ladder-N local level paths are enabled here.");
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
  markPhase("level:json:fetch:start", { id, url:url.href });
  const response = await fetch(url, { cache:"no-store" });
  if (!response.ok) throw new Error(`JSON level fetch failed: ${id} (${response.status})`);
  const data = validate(id, await response.json());
  markPhase("level:json:fetch:done", { id, nivraTypes:Object.keys(data.nivrayim).length });
  return data;
}

async function loadJsLevel(id, seal, markPhase) {
  const url = levelUrl(id, seal);
  markPhase("level:js:import:start", { id, url:url.href });
  const module = await import(url.href);
  const data = validate(id, typeof module.default === "function" ? await module.default() : module.default);
  markPhase("level:js:import:done", { id, nivraTypes:Object.keys(data.nivrayim).length });
  return data;
}

export function jsonSourcePath(id) {
  return String(id || "").replace(JS_RE, ".json").replace(JSON_RE, ".json");
}
