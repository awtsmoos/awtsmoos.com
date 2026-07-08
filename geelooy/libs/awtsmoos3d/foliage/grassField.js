// B"H
/** Instanced Chai grass: visible blades plus progressive hosted grass texture. */
import * as THREE from "/games/scripts/build/three.module.js";
import { finite, hash, setInstance } from "../math.js";
import { finishInstanced, markDecorative } from "../decor.js";
import { ACTUAL_TEXTURES, namedTexture } from "/games/mitzvahWorld/geelooy/libs/awtsmoosCinematicWorld/assets/ChaiForestStaticAssets.js";
import { progressiveMaterialMap } from "/games/mitzvahWorld/geelooy/libs/awtsmoosCinematicWorld/materials/ProgressiveTextureLoader.js";

const color = new THREE.Color(), materials = {};
const mix = (a, b, t) => a + (b - a) * t;
function mat(kind, colorValue, textureName) {
  if (materials[kind]) return materials[kind];
  const m = new THREE.MeshLambertMaterial({ color:colorValue, side:THREE.DoubleSide, vertexColors:true, name:`chai_lod_${kind}` });
  progressiveMaterialMap(THREE, m, namedTexture(textureName, true), { repeat:{ x:1, y:1 }, fallback:[colorValue >> 16 & 255, colorValue >> 8 & 255, colorValue & 255, 255] });
  Object.assign(m.userData, { chaiForestGrass:true, textureName, halfResolutionFirst:true, generatedOnceGrassMaterial:false });
  materials[kind] = m; return m;
}
function bladeGeo(height = 0.34, width = 0.045) {
  const geo = new THREE.BufferGeometry();
  const p = [-width,0,0, width,0,0, width*.26,height,.012, -width*.72,0,.014, width*.72,0,-.012, -width*.08,height*.9,0];
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(p), 3));
  geo.setIndex(new THREE.BufferAttribute(new Uint16Array([0,1,2,3,4,5]), 1));
  geo.computeBoundingSphere(); return geo;
}
function flowerGeo() { const geo = new THREE.PlaneGeometry(.09, .09, 1, 1); geo.rotateX(-Math.PI / 2); return geo; }
function patchPoint(patch, seed, i) {
  const a = hash(i, seed, 1) * Math.PI * 2, r = finite(patch.radius, 12) * Math.sqrt(hash(i, seed, 2));
  return { x:finite(patch.x) + Math.cos(a) * r, z:finite(patch.z) + Math.sin(a) * r };
}
function choose(patches, seed, i, radius) { return patches.length ? patches[Math.floor(hash(i, seed, 4) * patches.length)] : { x:0, z:0, radius }; }
function safeTint(mesh, i, base, alt, seed, warmth = 0) {
  const a = new THREE.Color(base || 0x6fbf55), b = new THREE.Color(alt || 0xa6df70);
  color.setRGB(mix(a.r,b.r,hash(i,seed,70)), mix(a.g,b.g,hash(i,seed,71)), mix(a.b,b.b,hash(i,seed,72)));
  color.offsetHSL((hash(i,seed,73)-.5)*.02, .08, .12 + warmth); color.r = Math.max(color.r,.18); color.g = Math.max(color.g,.38); color.b = Math.max(color.b,.12); mesh.setColorAt(i, color);
}
function blade(mesh, i, p, y, seed, tall = 1) {
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler((hash(i,seed,21)-.5)*.16, hash(i,seed,2)*Math.PI*2, (hash(i,seed,22)-.5)*.12));
  const s = new THREE.Vector3(.76+hash(i,seed,9)*.74, (.66+hash(i,seed,12)*.96)*tall, .76+hash(i,seed,15)*.74);
  setInstance(mesh, i, new THREE.Vector3(p.x, y, p.z), q, s);
}
function flower(mesh, i, p, y, seed) {
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, hash(i,seed,31) * Math.PI * 2, 0));
  const s = new THREE.Vector3(.82 + hash(i,seed,34) * .9, .82 + hash(i,seed,35) * .9, 1); setInstance(mesh, i, new THREE.Vector3(p.x, y + .055, p.z), q, s);
}
function makeMesh(geo, material, count, name) { const mesh = new THREE.InstancedMesh(geo, material, Math.max(1, count)); mesh.name = name; mesh.frustumCulled = true; return mesh; }
export function createGrassField(op = {}, heightAt = () => 0) {
  const patches = op.patches || [], count = Math.max(1, Math.floor(finite(op.count, 1400)));
  const tallCount = Math.floor(count * Math.min(finite(op.tallRatio, .18), .24)), flowerCount = Math.floor(count * Math.min(finite(op.flowerRatio, .14), .18));
  const short = makeMesh(bladeGeo(.34,.045), mat("grass",0x74bf52,ACTUAL_TEXTURES.grass), count, "chai_meadow_grass_1_many_blades");
  const tall = makeMesh(bladeGeo(.58,.038), mat("tall",0x5fae42,ACTUAL_TEXTURES.grass), tallCount, "chai_meadow_tall_grass_1_blades");
  const flowers = makeMesh(flowerGeo(), mat("flower",0xffe776,ACTUAL_TEXTURES.leaf), flowerCount, "chai_meadow_flower_leaf_1_sparks");
  for (let i=0;i<count;i+=1){ const p=patchPoint(choose(patches,7,i,finite(op.radius,60)),7,i); blade(short,i,p,heightAt(p.x,p.z)+finite(op.groundLift,.014),7,.88); safeTint(short,i,0x68b84b,0xd5ed71,7,.03); }
  for (let i=0;i<tallCount;i+=1){ const p=patchPoint(choose(patches,43,i,finite(op.radius,60)),43,i); blade(tall,i,p,heightAt(p.x,p.z)+finite(op.groundLift,.016),43,1.1); safeTint(tall,i,0x5fae42,0xc6e366,43,.03); }
  for (let i=0;i<flowerCount;i+=1){ const p=patchPoint(choose(patches,91,i,finite(op.radius,60)),91,i); flower(flowers,i,p,heightAt(p.x,p.z)+finite(op.groundLift,.02),91); safeTint(flowers,i,op.flowerColor||0xffe776,op.flowerAltColor||0xffb8df,91,.09); }
  finishInstanced([short,tall,flowers]); const group = new THREE.Group(); group.name = op.name || "ChaiGrassField_instanced_lod_meadow"; group.add(short,tall,flowers);
  group.userData.grassLod = { count, tallCount, flowerCount, drawCalls:3, texture:ACTUAL_TEXTURES.grass, visibleBlades:true };
  group.traverse(child => Object.assign(child.userData ||= {}, { skipRaycast:true, skipOctree:true, noOctree:true, villageDecor:true, lodGrass:true, chaiForestGrass:true })); return markDecorative(group);
}
export default createGrassField;
