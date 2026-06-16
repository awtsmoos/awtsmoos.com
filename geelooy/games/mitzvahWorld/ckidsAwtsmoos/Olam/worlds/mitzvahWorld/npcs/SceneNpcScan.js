// B"H
/** @file SceneNpcScan.js @description Counts actual spawned NPC roots without optional-chain parser paths. */
function dataOf(object) { return object && object.userData ? object.userData : {}; }
export function isSpawnedNpcRoot(object) { const data = dataOf(object), nivra = object && object.nivraAwtsmoos ? object.nivraAwtsmoos : {}; const name = String(object && object.name ? object.name : ""); return Boolean(data.mitzvahWorldNpcRoot === true || data.isNpc === true || data.awtsmoosVillageGuide === true || nivra.type === "interactiveNpc" || name.startsWith("npc_")); }
export function countSpawnedNpcRoots(scene) { let count = 0; if (!scene || typeof scene.traverse !== "function") return 0; scene.traverse(child => { if (isSpawnedNpcRoot(child)) count++; }); return count; }
