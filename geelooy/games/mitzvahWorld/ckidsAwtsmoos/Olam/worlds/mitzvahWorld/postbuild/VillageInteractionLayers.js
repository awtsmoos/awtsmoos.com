// B"H
/** @file VillageInteractionLayers.js @description Names every interaction layer so raycasts and colliders stop fighting. */
const KEY = "__awtsmoosVillageInteractionLayers";
function dataOf(object) { if (!object.userData) object.userData = {}; return object.userData; }
function lowerName(object) { return String(object && object.name ? object.name : "").toLowerCase(); }
function isTerrain(object, data) { return Boolean(data.proceduralTerrain || lowerName(object).includes("terrain")); }
function isInteraction(data) { return Boolean(data.awtsmoosRayProxy || data.explicitTapOnly || data.selectableCombatTarget); }
function gather(scene) { const out = { terrain:[], world:[], decor:[], interaction:[] }; if (!scene || typeof scene.traverse !== "function") return out; scene.traverse(object => { const data = dataOf(object); if (isTerrain(object, data)) out.terrain.push(object); else if (isInteraction(data)) out.interaction.push(object); else if (data.villageDecor || data.skipRaycast) out.decor.push(object); else if (object.isMesh) out.world.push(object); }); return out; }
function markList(list, values) { list.forEach(object => Object.assign(dataOf(object), values)); }
function label(set) { markList(set.decor, { skipRaycast:true, skipOctree:true, noOctree:true, interactionLayer:"decor" }); markList(set.interaction, { skipRaycast:false, skipOctree:true, noOctree:true, interactionLayer:"explicit-interaction" }); markList(set.terrain, { interactionLayer:"terrain" }); set.world.forEach(object => { const data = dataOf(object); data.interactionLayer = data.interactionLayer || "world"; }); }
function names(list) { return list.slice(0, 20).map(object => object.name || object.type || "unnamed"); }
function registryFrom(layers) { const counts = {}, nameMap = {}; for (const key of Object.keys(layers)) { counts[key] = layers[key].length; nameMap[key] = names(layers[key]); } return { createdAt:Date.now(), counts, names:nameMap }; }
function sceneOf(context, olam) { return context && context.scene ? context.scene : olam && olam.scene ? olam.scene : null; }
export async function ensureVillageInteractionLayers(context = {}) { const olam = context.olam || context, scene = sceneOf(context, olam); if (!scene || !olam) return null; if (olam[KEY]) return olam[KEY]; const layers = gather(scene); label(layers); const registry = registryFrom(layers); olam.awtsmoosInteractionLayers = registry; olam[KEY] = registry; return registry; }
