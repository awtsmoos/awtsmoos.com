// B"H
import * as THREE from '/games/scripts/build/three.module.js';
import { namedTexture, ACTUAL_TEXTURES } from '../geelooy/libs/awtsmoosCinematicWorld/assets/ChaiForestStaticAssets.js';
import { progressiveMaterialMap } from '../geelooy/libs/awtsmoosCinematicWorld/materials/ProgressiveTextureLoader.js';
const DUMMY = new THREE.Object3D();
function rng(seed = 777) { let s = Array.from(String(seed)).reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 2166136261); return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
export async function buildGrassPatch(scene, physics, def) {
  const { radius = 80, count = 120, color = 0x5cb85c, seed = def.id || 777, textureName = ACTUAL_TEXTURES.grass } = def.props || {};
  const [px, py, pz] = def.position || [0, 0, 0]; const random = rng(seed);
  const geo = new THREE.BoxGeometry(0.08, 1, 0.08); const mat = new THREE.MeshLambertMaterial({ color, alphaTest: 0.35 });
  progressiveMaterialMap(THREE, mat, namedTexture(textureName, true), { repeat: { x: 1, y: 1 } });
  const mesh = new THREE.InstancedMesh(geo, mat, count); mesh.castShadow = false; mesh.receiveShadow = true; mesh.name = def.id;
  for (let i = 0; i < count; i++) { const a = random() * Math.PI * 2, d = Math.sqrt(random()) * radius, h = 0.2 + random() * 0.3; DUMMY.position.set(px + Math.cos(a) * d, py + h / 2, pz + Math.sin(a) * d); DUMMY.rotation.y = random() * Math.PI * 2; DUMMY.scale.set(1, h * 2, 1); DUMMY.updateMatrix(); mesh.setMatrixAt(i, DUMMY.matrix); }
  mesh.instanceMatrix.needsUpdate = true; mesh.userData.progressiveGrassTexture = namedTexture(textureName, true); return [mesh];
}
