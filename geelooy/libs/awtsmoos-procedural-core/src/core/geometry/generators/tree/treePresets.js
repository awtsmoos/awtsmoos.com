// B"H
/** @file treePresets.js @description Complete tree preset registry: ez-tree absorbed plus Awtsmoos varieties. */
import EZ_TREE_PRESETS from "./ezTreePresets.js";
import AWTSMOOS_TREE_VARIETY_PRESETS from "./awtsmoosTreeVarietyPresets.js";
import { canonicalBarkType, canonicalLeafType, TREE_MATERIAL_NEEDS } from "./treeMaterialCatalog.js";

const LEGACY_PRESETS = Object.freeze({
  "Sakura": { name:"Sakura", seed:8888, type:"deciduous", bark:{ type:"bark_sakura", tint:0x7d514d }, branch:{ levels:4, children:{0:5,1:6,2:14,3:18}, force:{direction:{x:0,y:.3,z:0},strength:.03}, gnarliness:{0:.2,1:.4,2:.5,3:.6,4:.5}, length:{0:25,1:15,2:8,3:4,4:2}, radius:{0:4,1:1.5,2:.6,3:.2,4:.05}, sections:{0:12,1:8,2:5,3:4,4:3}, segments:{0:12,1:8,2:5,3:4,4:3}, start:{1:.1,2:.1,3:.1,4:.1}, taper:{0:.5,1:.7,2:.85,3:.95,4:1}, angle:{1:40,2:50,3:60,4:80} }, leaves:{ type:"leaf_sakura", count:20, size:2.2, start:.12, tint:[1,.7,.85,1] } },
  "Dead Tree": { name:"Dead Tree", seed:777, type:"dead", bark:{ type:"bark_dead", tint:0x5b4638 }, branch:{ levels:5, children:{0:5,1:4,2:6,3:8,4:6}, force:{direction:{x:0,y:-.5,z:0},strength:.05}, gnarliness:{0:.2,1:.4,2:.5,3:.6,4:.8,5:.9}, length:{0:25,1:12,2:6,3:3,4:1.5,5:.8}, radius:{0:3,1:1,2:.4,3:.15,4:.05,5:.02}, sections:{0:10,1:8,2:5,3:3,4:3,5:2}, segments:{0:12,1:8,2:5,3:4,4:3,5:3}, start:{1:.05,2:.05,3:.1,4:.1,5:.1}, taper:{0:.6,1:.8,2:.9,3:1,4:1,5:1}, angle:{1:45,2:55,3:65,4:80,5:90} }, leaves:{ type:"leaf_dead", count:0, size:0, tint:[0,0,0,0] } }
});

function clone(value) { return typeof structuredClone === "function" ? structuredClone(value) : JSON.parse(JSON.stringify(value)); }
function normalizePreset(name, source) {
  const p = clone(source);
  p.name = p.name || name;
  p.type = String(p.type || "deciduous").toLowerCase();
  p.bark = { type:canonicalBarkType(p.bark?.type), tint:0xffffff, textured:true, flatShading:false, textureScale:{x:1,y:1}, ...(p.bark || {}) };
  p.bark.type = canonicalBarkType(p.bark.type);
  p.leaves = { type:"leaf_oak", billboard:"double", angle:10, count:1, start:0, size:2, sizeVariance:.5, alphaTest:.35, roundedNormals:true, ...(p.leaves || {}) };
  p.leaves.type = canonicalLeafType(p.leaves.type);
  p.materials = { barkType:p.bark.type, leafType:p.leaves.type, drawCalls:2, needs:TREE_MATERIAL_NEEDS };
  return Object.freeze(p);
}

export const TREE_PRESETS = Object.freeze(Object.fromEntries(
  Object.entries({ ...EZ_TREE_PRESETS, ...LEGACY_PRESETS, ...AWTSMOOS_TREE_VARIETY_PRESETS }).map(([name, preset]) => [name, normalizePreset(name, preset)])
));
export const TREE_PRESET_ALIASES = Object.freeze({ oak:"Oak Medium", pine:"Pine Medium", ash:"Ash Medium", aspen:"Aspen Medium", bush:"Bush 1", willow:"Willow Weeping", palm:"Date Palm", redwood:"Redwood Giant" });
export const TREE_PRESET_NAMES = Object.freeze(Object.keys(TREE_PRESETS));
export function listTreePresets() { return Array.from(TREE_PRESET_NAMES); }
export function getTreePreset(name = "Oak Medium") {
  const key = TREE_PRESETS[name] ? name : TREE_PRESET_ALIASES[String(name).toLowerCase()] || "Oak Medium";
  return clone(TREE_PRESETS[key]);
}
export { TREE_MATERIAL_NEEDS };
export default TREE_PRESETS;
