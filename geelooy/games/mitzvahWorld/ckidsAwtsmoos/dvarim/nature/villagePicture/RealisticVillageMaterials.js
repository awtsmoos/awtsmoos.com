// B"H
/** @file RealisticVillageMaterials.js @description Chapter 946: stable API now imports botanical RAM shader texture law. */
import * as THREE from "/games/scripts/build/three.module.js";
import { shaderVillageMaterial, warmVillageShaderTextures, getVillageShaderTextureStats } from "./ProceduralShaderTextureLibrary.js?v=webgl-progress-shader-textures-20260612-bh1";
const geos = new Map();
export { warmVillageShaderTextures, getVillageShaderTextureStats };
export function rvMaterial(kind = "wood", options = {}) { return shaderVillageMaterial(kind, options); }
export function rvGeometry(kind = "box") { if (geos.has(kind)) return geos.get(kind); const g = kind === "cylinder" ? new THREE.CylinderGeometry(.5, .5, 1, 12) : kind === "sphere" ? new THREE.SphereGeometry(.5, 12, 8) : kind === "plane" ? new THREE.PlaneGeometry(1, 1) : new THREE.BoxGeometry(1, 1, 1); g.computeBoundingBox(); g.computeBoundingSphere(); geos.set(kind, g); return g; }
export function rvMesh(kind, materialKind, pos, scale, rot = [0, 0, 0], options = {}) { const mesh = new THREE.Mesh(rvGeometry(kind), rvMaterial(materialKind, options)); mesh.position.set(pos[0] || 0, pos[1] || 0, pos[2] || 0); mesh.scale.set(scale[0] || 1, scale[1] || 1, scale[2] || 1); mesh.rotation.set(rot[0] || 0, rot[1] || 0, rot[2] || 0); mesh.castShadow = false; mesh.receiveShadow = true; Object.assign(mesh.userData ||= {}, { villageDecor: true, skipOctree: true, noOctree: true, skipRaycast: true, realisticVillage: true, ramShaderTexture: true, botanicalShader: true }); return mesh; }
export function rvGroup(name = "realistic_village_group") { const g = new THREE.Group(); g.name = name; Object.assign(g.userData, { villageDecor: true, skipOctree: true, noOctree: true, skipRaycast: true, realisticVillage: true, ramShaderTexture: true, botanicalShader: true }); return g; }
export function rvSeal(root) { root?.traverse?.(c => Object.assign(c.userData ||= {}, { villageDecor: true, skipOctree: true, noOctree: true, skipRaycast: true, realisticVillage: true, ramShaderTexture: true, botanicalShader: true })); return root; }
