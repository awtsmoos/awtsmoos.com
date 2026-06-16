// B"H
/** @file CarcassRuntime.js @description Non-graphic carcass interaction state and UI payloads. */
import { animalKosherData } from "./KosherAnimalIndex.js";
function playerOf(olam) { return olam?.player || olam?.chossid || null; }
function posOf(x) { return x?.mesh?.position || x?.position || { x:0, z:0 }; }
function dist(a, b) { return Math.hypot((a.x || 0) - (b.x || 0), (a.z || 0) - (b.z || 0)); }
function idOf(animal) { return animal?.userData?.motion?.id || animal?.userData?.id || animal?.name || `animal_${Date.now()}`; }
function animalActors(olam) { return [...(olam?.__livingRegionWildlifeRoot?.children || []), ...(olam?.nivrayim || [])].filter(a => a?.userData?.wildlifeActor || a?.userData?.species); }
export function ensureCarcassState(olam) { olam.__carcasses ||= {}; return olam.__carcasses; }
export function createCarcass(olam, animal, options = {}) {
  const state = ensureCarcassState(olam), species = animal?.userData?.species || options.species || "animal", data = animalKosherData(species), p = posOf(animal);
  const id = `carcass_${idOf(animal)}`; state[id] ||= { id, animalId:idOf(animal), species, name:`${data.name} Carcass`, x:p.x || 0, z:p.z || 0, kosherSpecies:data.kosherSpecies, requiresShechitaKnife:data.requiresShechitaKnife, processed:false, selections:[], source:"animal-defeat", createdAt:Date.now(), disclaimer:"Educational gameplay only; no practical halachic ruling." };
  animal.userData ||= {}; animal.userData.carcassId = id; animal.userData.carcassAvailable = true; return state[id];
}
export function scanDeadAnimalCarcasses(olam, radius = 14) {
  const player = playerOf(olam), pp = posOf(player); if (!player) return [];
  return animalActors(olam).filter(a => a?.userData?.health?.dead && !a.userData.carcassAvailable && dist(pp, posOf(a)) <= radius).map(a => createCarcass(olam, a));
}
export function nearestCarcass(olam, radius = 12) {
  scanDeadAnimalCarcasses(olam, radius + 4);
  const player = playerOf(olam), pp = posOf(player); if (!player) return null; let best = null, bestD = Infinity;
  for (const c of Object.values(ensureCarcassState(olam))) { if (c.processed) continue; const d = dist(pp, c); if (d < bestD) { best = c; bestD = d; } }
  return best && bestD <= radius ? { carcass:best, distance:bestD } : null;
}
export function carcassPayload(olam, carcass = null) { const c = carcass || nearestCarcass(olam)?.carcass || null; return { open:Boolean(c), carcass:c, choices:c ? ["basar_shechuta", "hide", "leather", "fur"] : [], disclaimer:"Educational kosher-craft gameplay only." }; }
export function openCarcassUi(olam, carcass = null) { const payload = carcassPayload(olam, carcass); olam?.ayshPeula?.("ui event", "carcassPanel", payload); return payload; }
export default { ensureCarcassState, createCarcass, scanDeadAnimalCarcasses, nearestCarcass, carcassPayload, openCarcassUi };
