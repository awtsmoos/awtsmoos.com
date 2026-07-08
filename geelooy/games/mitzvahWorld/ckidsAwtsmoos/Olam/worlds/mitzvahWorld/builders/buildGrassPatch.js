// B"H
/** Chai grass patch builder: textured lightweight blades, not old heavy tuft shader. */
import * as THREE from "/games/scripts/build/three.module.js";
import { ACTUAL_TEXTURES, namedTexture } from "/games/mitzvahWorld/geelooy/libs/awtsmoosCinematicWorld/assets/ChaiForestStaticAssets.js";
import { progressiveMaterialMap } from "/games/mitzvahWorld/geelooy/libs/awtsmoosCinematicWorld/materials/ProgressiveTextureLoader.js";

const DUMMY = new THREE.Object3D();
const COLOR = new THREE.Color();
const MAX_PATCH_BLADES = 180;
const DEFAULT_PATCH_BLADES = 120;

function propsOf(def) { return def?.props || {}; }
function positionOf(def) { return Array.isArray(def?.position) ? def.position : [0, 0, 0]; }
function finite(value, fallback) { return Number.isFinite(Number(value)) ? Number(value) : fallback; }
function rng(seed = 777) {
  let s = Array.from(String(seed)).reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 2166136261);
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}
function bladeGeometry() {
  const geo = new THREE.BufferGeometry();
  const p = [-.035,0,0,.035,0,0,.022,.24,.012,-.022,.24,-.012,0,.46,0];
  const uv = [0,0,1,0,.8,.56,.2,.56,.5,1];
  geo.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex([0, 1, 2, 0, 2, 3, 3, 2, 4]);
  geo.computeVertexNormals(); geo.computeBoundingSphere(); return geo;
}
function makeMaterial(textureName) {
  const mat = new THREE.MeshLambertMaterial({ color:0x8fd35c, side:THREE.DoubleSide, vertexColors:true, alphaTest:.28, name:"chai_textured_blade_grass" });
  progressiveMaterialMap(THREE, mat, namedTexture(textureName, true), { repeat:{ x:1, y:1 }, fallback:[122, 184, 70, 255] });
  Object.assign(mat.userData ||= {}, { chaiHostedGrassTexture:true, oldFlatShaderRemoved:true, textureName });
  return mat;
}
function placeBlade(mesh, i, random, radius) {
  const a = random() * Math.PI * 2, d = Math.sqrt(random()) * radius;
  const h = .72 + random() * .95, w = .72 + random() * .62;
  DUMMY.position.set(Math.cos(a) * d, 0, Math.sin(a) * d);
  DUMMY.rotation.set((random() - .5) * .16, random() * Math.PI * 2, (random() - .5) * .12);
  DUMMY.scale.set(w, h, w); DUMMY.updateMatrix(); mesh.setMatrixAt(i, DUMMY.matrix);
  COLOR.setHSL(.25 + random() * .06, .56 + random() * .18, .38 + random() * .18); mesh.setColorAt(i, COLOR);
}
function bindTinyWind(olam, mesh) {
  if (!olam?.tzimtzum?.onUpdate) return;
  olam.tzimtzum.onUpdate((t, dt) => { mesh.userData.windTime = finite(mesh.userData.windTime, 0) + finite(dt, 0) * .7; });
}
export async function buildGrassPatch(scene, physics, def, olam = null) {
  const props = propsOf(def), [x, y, z] = positionOf(def);
  const requested = Math.floor(finite(props.count, DEFAULT_PATCH_BLADES));
  const cap = Math.max(24, Math.min(Math.floor(finite(props.maxVisibleBlades, MAX_PATCH_BLADES)), MAX_PATCH_BLADES));
  const count = Math.max(12, Math.min(requested, cap));
  const radius = Math.max(1, finite(props.radius, 12));
  const textureName = props.textureName || ACTUAL_TEXTURES.grass;
  const mesh = new THREE.InstancedMesh(bladeGeometry(), makeMaterial(textureName), count);
  mesh.name = def?.id || "chai_textured_light_grass_patch"; mesh.position.set(finite(x, 0), finite(y, 0), finite(z, 0));
  mesh.frustumCulled = true; mesh.castShadow = false; mesh.receiveShadow = true;
  const random = rng(props.seed || def?.id || 777); for (let i = 0; i < count; i += 1) placeBlade(mesh, i, random, radius);
  mesh.instanceMatrix.needsUpdate = true; if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true; bindTinyWind(olam, mesh);
  Object.assign(mesh.userData ||= {}, { chaiGrassPatch:true, texturedBlades:true, oldProceduralTuftShaderRemoved:true, requested, count, maxVisibleBlades:cap, textureName, verticesPerBlade:5, trianglesPerBlade:3, skipRaycast:true, skipOctree:true, noOctree:true, villageDecor:true });
  return [mesh];
}
export default buildGrassPatch;
