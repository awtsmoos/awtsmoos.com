// B"H
/** @file AnimalBeautyTuning.js @description One-pass beauty tuning with zero new child meshes or frame loops. */
const ANIMAL = /single_mesh_animal|single_mesh_fast|wildlife|fox|rabbit|deer|goat|cow|frog|bird/i;
const HOUSE = /cottage|roof|window|door|mezuzah|chimney|shutter|gable|house/i;
function mats(o) { return (Array.isArray(o?.material) ? o.material : [o?.material]).filter(Boolean); }
function tuneMaterial(material, kind) { material.userData ||= {}; material.userData.awtsmoosBeautyTuned = kind; material.needsUpdate = true; if (kind === "animal") { material.roughness = Math.max(.82, Number(material.roughness) || .86); material.metalness = 0; } if (kind === "house") material.roughness = Math.max(.72, Number(material.roughness) || .78); }
export function tuneAnimalAndHouseBeauty(scene) { const report = { scanned:0, animals:0, houses:0, materials:0, examples:[] }; scene?.traverse?.(o => { report.scanned++; const name = `${o.name || ""} ${o.userData?.species || ""} ${o.type || ""}`; const kind = ANIMAL.test(name) ? "animal" : HOUSE.test(name) ? "house" : null; if (!kind) return; if (kind === "animal") { o.userData ||= {}; o.userData.beautyTuned = true; o.userData.singleMeshBeauty = true; report.animals++; } else report.houses++; for (const m of mats(o)) { tuneMaterial(m, kind); report.materials++; } if (report.examples.length < 16) report.examples.push({ name:o.name || o.type, kind }); }); globalThis.__AWTSMOOS_BEAUTY_TUNING__ = report; return report; }
export default tuneAnimalAndHouseBeauty;
