// B"H
/** Chai forest field: minimal budgeted procedural-core Chai prototype instancing for 60fps play. */
import * as THREE from "/games/scripts/build/three.module.js";
import { finite, hash } from "../math.js";
import { markDecorative } from "../decor.js";
import { createHeroTree } from "../tree/heroTree.js?v=procedural-core-chai-worker-safe-20260707-bh7";
import { ACTUAL_TEXTURES, namedTexture } from "/games/mitzvahWorld/geelooy/libs/awtsmoosCinematicWorld/assets/ChaiForestStaticAssets.js";

const DEFAULT_MAX_PROCEDURAL_TREES = 2;
const tmpMatrix = new THREE.Matrix4(), tmpPos = new THREE.Vector3(), tmpQuat = new THREE.Quaternion(), tmpScale = new THREE.Vector3();
function pick(patches, seed, i) { return patches[Math.floor(hash(i, seed, 4) * patches.length)] || { x:0, z:0, radius:42 }; }
function point(patch, seed, i) { const a = hash(i, seed, 1) * Math.PI * 2, r = finite(patch.radius, 30) * Math.sqrt(hash(i, seed, 2)); return { x:finite(patch.x) + Math.cos(a) * r, z:finite(patch.z) + Math.sin(a) * r }; }
function makePrototype() { const tree = createHeroTree({ name:"chai_procedural_core_budget_oak_prototype", kind:"oak", variant:0, x:0, y:0, z:0, scale:1, barkMapUrl:namedTexture(ACTUAL_TEXTURES.bark, true), leafMapUrl:namedTexture(ACTUAL_TEXTURES.leaf, true) }, {}); tree.updateMatrixWorld(true); return tree; }
function collectPrototypeMeshes(proto) { const meshes = []; proto.traverse(node => { if (node?.isMesh && node.geometry && node.material) { node.updateMatrixWorld(true); meshes.push({ name:node.name || `prototype_mesh_${meshes.length}`, geometry:node.geometry, material:node.material, matrix:node.matrixWorld.clone() }); } }); return meshes; }
function composeTreeMatrix(op) { tmpPos.set(op.x, op.y, op.z); tmpQuat.setFromEuler(new THREE.Euler(0, op.rotationY, 0)); tmpScale.set(op.scale * op.wide, op.scale * op.tall, op.scale * op.wide); return tmpMatrix.compose(tmpPos, tmpQuat, tmpScale).clone(); }
function makeInstanceData(patches, count, seed, op, heightAt) {
  const data = [];
  for (let i = 0; i < count; i += 1) { const p = point(pick(patches, seed, i), seed, i); const base = finite(op.scale, .62) * (.52 + hash(i, seed, 7) * .20); data.push(composeTreeMatrix({ x:p.x, y:heightAt(p.x, p.z), z:p.z, scale:base, wide:.9 + hash(i, seed, 12) * .2, tall:.95 + hash(i, seed, 13) * .28, rotationY:hash(i, seed, 11) * Math.PI * 2 })); }
  return data;
}
function instancedLayer(layer, matrices, index) {
  const mesh = new THREE.InstancedMesh(layer.geometry, layer.material, matrices.length);
  mesh.name = `chai_budget_procedural_core_instanced_${index}_${layer.name}`; mesh.castShadow = false; mesh.receiveShadow = true; mesh.frustumCulled = true;
  const final = new THREE.Matrix4(); matrices.forEach((treeMatrix, i) => mesh.setMatrixAt(i, final.multiplyMatrices(treeMatrix, layer.matrix))); mesh.instanceMatrix.needsUpdate = true;
  Object.assign(mesh.userData ||= {}, { skipRaycast:true, skipOctree:true, noOctree:true, villageDecor:true, chaiForestTree:true, proceduralCoreTree:true, instancedProceduralCoreTree:true, triangleBudgeted:true, layerName:layer.name }); return mesh;
}
export function createForestField(op = {}, heightAt = () => 0) {
  const patches = op.patches?.length ? op.patches : [{ x:0, z:0, radius:72 }];
  const requested = Math.floor(finite(op.count, DEFAULT_MAX_PROCEDURAL_TREES));
  const cap = Math.max(1, Math.min(Math.floor(finite(op.maxProceduralTrees, DEFAULT_MAX_PROCEDURAL_TREES)), DEFAULT_MAX_PROCEDURAL_TREES));
  const count = Math.max(1, Math.min(requested, cap));
  const seed = finite(op.seed, 121), prototype = makePrototype(), layers = collectPrototypeMeshes(prototype).slice(0, 2), matrices = makeInstanceData(patches, count, seed, op, heightAt);
  const group = new THREE.Group(); group.name = op.name || "ChaiForestField_budgeted_instanced_procedural_core"; layers.forEach((layer, i) => group.add(instancedLayer(layer, matrices, i)));
  Object.assign(group.userData, { lodForest:{ requested, count, maxProceduralTrees:cap, prototypes:1, prototypeLayers:layers.length, drawCallsEstimate:layers.length, generatorPath:"/libs/awtsmoos-procedural-core/src/core/geometry/generators/tree/treeGenerator.js", chaiForestTextures:[ACTUAL_TEXTURES.bark, ACTUAL_TEXTURES.leaf], noConeTrees:true, noSphereTrees:true, workerSafeBitmapTextures:true, densityReducedForFps:true, instancedProceduralCorePrototype:true, triangleBudgetedFor60fps:true, minimalForestBudget:true } });
  return markDecorative(group);
}
export default createForestField;
