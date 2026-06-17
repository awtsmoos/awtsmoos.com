// B"H
/** Pasteable universe JSON shape guard: worlds, beings, quests, cinema, episodes. */
const ARRAYS = ["regions", "characters", "buildings", "quests", "dialogues", "cutscenes", "episodes"];
const REQUIRED = ["world"];
function isObj(v) { return !!v && typeof v === "object" && !Array.isArray(v); }
function copy(v) { return JSON.parse(JSON.stringify(v || {})); }
function missing(data) { return REQUIRED.filter(k => !(k in data)); }
export function normalizeUniverseJson(input = {}) {
  const data = typeof input === "string" ? JSON.parse(input) : copy(input);
  const miss = missing(data);
  if (miss.length) throw new Error(`Universe JSON missing: ${miss.join(", ")}`);
  for (const key of ARRAYS) if (!Array.isArray(data[key])) data[key] = [];
  if (!isObj(data.world)) data.world = { id:"unnamed_world", title:String(data.world || "Unnamed World") };
  data.meta = { normalizedAt:new Date().toISOString(), schema:"awtsmoos-universe-json-v1", counts:Object.fromEntries(ARRAYS.map(k => [k, data[k].length])) };
  return data;
}
export function summarizeUniverseJson(input = {}) {
  const data = normalizeUniverseJson(input);
  return { world:data.world, counts:data.meta.counts, firstEpisode:data.episodes[0]?.id || null, firstCutscene:data.cutscenes[0]?.id || null };
}
export const UNIVERSE_JSON_REQUIRED_ARRAYS = Object.freeze(ARRAYS);
