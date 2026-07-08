// B"H
/**
 * @file LevelSource.js
 * @description
 * The boot gate accepts only known local level vessels, including the May New
 * Year village. Case-sensitive scene filenames are preserved so macOS, phones,
 * and the browser all fetch the same revealed JSON vessel.
 */
const LADDER_MAX = 20;
const JSON_RE = /\.json$/i;
const JS_RE = /\.js$/i;
const EXT_RE = /\.(?:js|json)$/i;
const MESSAGE = "Only village, village-meadow, mayNewYearVillage, and ladder-N local level paths are enabled here.";
const SPECIAL_LEVELS = [
  ["village", "village.json"],
  ["village.json", "village.json"],
  ["village.js", "village.js"],
  ["village-meadow", "village-meadow.json"],
  ["village-meadow.json", "village-meadow.json"],
  ["village-meadow.js", "village-meadow.js"],
  ["maynewyearvillage", "mayNewYearVillage.json"],
  ["maynewyearvillage.json", "mayNewYearVillage.json"],
  ["maynewyearvillage.js", "mayNewYearVillage.js"]
];
function allowedMap() {
  const map = new Map(SPECIAL_LEVELS);
  for (let i = 1; i <= LADDER_MAX; i += 1) {
    map.set(`ladder-${i}`, `ladder-${i}.json`);
    map.set(`ladder-${i}.json`, `ladder-${i}.json`);
    map.set(`ladder-${i}.js`, `ladder-${i}.js`);
  }
  return map;
}
function safeBasename(rawText) {
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(rawText) || rawText.includes("\\")) throw new Error(MESSAGE);
  const noQuery = rawText.split(/[?#]/)[0];
  const parts = noQuery.split("/").filter(Boolean);
  return (parts.pop() || noQuery).trim();
}
function normalizeKey(name) {
  const clean = String(name || "").trim();
  if (!clean) return "";
  if (EXT_RE.test(clean)) return clean.toLowerCase();
  return `${clean}.json`.toLowerCase();
}
export function normalizeLevelId(raw) {
  const rawText = String(raw ?? "").trim();
  if (!rawText) return null;
  const key = normalizeKey(safeBasename(rawText));
  const canonical = allowedMap().get(key);
  if (!canonical) throw new Error(MESSAGE);
  return canonical;
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
