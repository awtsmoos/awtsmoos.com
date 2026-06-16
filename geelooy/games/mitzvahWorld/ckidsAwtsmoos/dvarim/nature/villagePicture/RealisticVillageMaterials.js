// B"H
/** @file RealisticVillageMaterials.js @description Grounded village material API, parser-clear, RAM procedural textures. */
import * as THREE from "/games/scripts/build/three.module.js";
import { shaderVillageMaterial, warmVillageShaderTextures, getVillageShaderTextureStats } from "./ProceduralShaderTextureLibrary.js?v=awtsmoos-shader-textures-20260614-bh2";
const geos = new Map();
const FLAGS = Object.freeze({ villageDecor:true, skipOctree:true, noOctree:true, skipRaycast:true, realisticVillage:true, ramShaderTexture:true, botanicalShader:true });
export { warmVillageShaderTextures, getVillageShaderTextureStats };
function dataOf(object) { if (!object.userData) object.userData = {}; return object.userData; }
function mark(object) { Object.assign(dataOf(object), FLAGS); return object; }
function makeGeometry(kind) { if (kind === "cylinder") return new THREE.CylinderGeometry(.5, .5, 1, 12); if (kind === "sphere") return new THREE.SphereGeometry(.5, 12, 8); if (kind === "plane") return new THREE.PlaneGeometry(1, 1); return new THREE.BoxGeometry(1, 1, 1); }
export function rvMaterial(kind = "wood", options = {}) { return shaderVillageMaterial(kind, options); }
export function rvGeometry(kind = "box") { if (geos.has(kind)) return geos.get(kind); const g = makeGeometry(kind); g.computeBoundingBox(); g.computeBoundingSphere(); geos.set(kind, g); return g; }
export function rvMesh(kind, materialKind, pos, scale, rot = [0, 0, 0], options = {}) { const mesh = new THREE.Mesh(rvGeometry(kind), rvMaterial(materialKind, options)); mesh.position.set(pos[0] || 0, pos[1] || 0, pos[2] || 0); mesh.scale.set(scale[0] || 1, scale[1] || 1, scale[2] || 1); mesh.rotation.set(rot[0] || 0, rot[1] || 0, rot[2] || 0); mesh.castShadow = false; mesh.receiveShadow = true; return mark(mesh); }
export function rvGroup(name = "realistic_village_group") { const g = new THREE.Group(); g.name = name; return mark(g); }
export function rvSeal(root) { if (!root) return root; if (typeof root.traverse === "function") root.traverse(mark); else mark(root); return root; }
