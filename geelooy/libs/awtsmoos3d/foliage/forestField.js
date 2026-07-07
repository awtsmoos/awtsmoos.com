// B"H
/**
 * @file forestField.js
 * @description Instanced village forest with honest LOD: many trees as few draws.
 * The Awtsmoos does not amputate the forest for speed; it folds near trunks,
 * mid crowns, and far silhouettes into three vessels so gameplay breathes at 60.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { finite, hash, setInstance } from "../math.js";
import { finishInstanced, markDecorative } from "../decor.js";

const trunkMat = new THREE.MeshLambertMaterial({ color: 0x7b5532, name: "awts_lod_tree_trunk" });
const leafMat = new THREE.MeshLambertMaterial({ color: 0x3f8f3f, name: "awts_lod_tree_leaf" });
const farMat = new THREE.MeshLambertMaterial({ color: 0x2f7336, name: "awts_lod_far_tree_silhouette" });
[trunkMat, leafMat, farMat].forEach(m => Object.assign(m.userData ||= {}, { worldPersistentAsset:true }));

function patchPoint(patch, seed, i) {
  const a = hash(i, seed, 1) * Math.PI * 2;
  const r = finite(patch.radius, 20) * Math.sqrt(hash(i, seed, 2));
  return { x: finite(patch.x) + Math.cos(a) * r, z: finite(patch.z) + Math.sin(a) * r };
}
function choose(patches, seed, i) { return patches[Math.floor(hash(i, seed, 4) * patches.length)] || { x:0, z:0, radius:20 }; }
function instance(mesh, i, p, y, scale, seed) {
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, hash(i, seed, 9) * Math.PI * 2, 0));
  setInstance(mesh, i, new THREE.Vector3(p.x, y, p.z), q, new THREE.Vector3(scale, scale, scale));
}
function makeMesh(geo, mat, count, name) {
  const mesh = new THREE.InstancedMesh(geo, mat, Math.max(1, count));
  mesh.name = name;
  mesh.frustumCulled = true;
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  return mesh;
}
function fillLayer(mesh, count, patches, heightAt, seed, lift, scaleMul, yMul = 0) {
  for (let i = 0; i < count; i += 1) {
    const p = patchPoint(choose(patches, seed, i), seed, i);
    const s = scaleMul * (0.72 + hash(i, seed, 3) * 0.72);
    instance(mesh, i, p, heightAt(p.x, p.z) + lift + s * yMul, s, seed);
  }
}
export function createForestField(op = {}, heightAt = () => 0) {
  const patches = op.patches?.length ? op.patches : [{ x:0, z:0, radius:60 }];
  const count = Math.max(1, Math.floor(finite(op.count, 180)));
  const nearCount = Math.max(12, Math.floor(count * 0.34));
  const midCount = Math.max(18, Math.floor(count * 0.42));
  const farCount = Math.max(24, count - nearCount - midCount);
  const trunk = makeMesh(new THREE.CylinderGeometry(0.22, 0.34, 3.2, 5, 1), trunkMat, nearCount, "lod_forest_near_trunks");
  const leaves = makeMesh(new THREE.ConeGeometry(1.45, 4.2, 7, 1), leafMat, midCount + nearCount, "lod_forest_mid_leaf_crowns");
  const far = makeMesh(new THREE.ConeGeometry(1.8, 5.0, 5, 1), farMat, farCount, "lod_forest_far_silhouettes");
  fillLayer(trunk, nearCount, patches, heightAt, finite(op.seed, 121), 1.55, finite(op.scale, 1), 1.55);
  fillLayer(leaves, midCount + nearCount, patches, heightAt, finite(op.seed, 121) + 17, 3.2, finite(op.scale, 1.05), 2.35);
  fillLayer(far, farCount, patches, heightAt, finite(op.seed, 121) + 91, 2.5, finite(op.scale, 1.2), 1.9);
  finishInstanced([trunk, leaves, far]);
  const group = new THREE.Group();
  group.name = op.name || "AwtsmoosVillageForestField_many_trees_lod";
  group.add(far, trunk, leaves);
  group.userData.lodForest = { count, nearCount, midCount, farCount, drawCalls:3 };
  group.traverse(child => Object.assign(child.userData ||= {}, { skipRaycast:true, skipOctree:true, noOctree:true, villageDecor:true, lodForest:true }));
  return markDecorative(group);
}
export default createForestField;
