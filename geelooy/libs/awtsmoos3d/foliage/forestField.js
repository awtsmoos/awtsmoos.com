// B"H
/** Chai forest field: capped procedural-core trees for real geometry and playable FPS. */
import * as THREE from "/games/scripts/build/three.module.js";
import { finite, hash } from "../math.js";
import { markDecorative } from "../decor.js";
import { createHeroTree } from "../tree/heroTree.js?v=procedural-core-chai-worker-safe-20260707-bh3";
import { ACTUAL_TEXTURES, namedTexture } from "/games/mitzvahWorld/geelooy/libs/awtsmoosCinematicWorld/assets/ChaiForestStaticAssets.js";

const DEFAULT_MAX_PROCEDURAL_TREES = 24;
const kindFor = (seed, i) => hash(i, seed, 8) < .28 ? "pine" : hash(i, seed, 9) < .52 ? "willow" : hash(i, seed, 10) < .72 ? "apple" : "oak";
function pick(patches, seed, i) { return patches[Math.floor(hash(i, seed, 4) * patches.length)] || { x:0, z:0, radius:42 }; }
function point(patch, seed, i) {
  const a = hash(i, seed, 1) * Math.PI * 2;
  const r = finite(patch.radius, 30) * Math.sqrt(hash(i, seed, 2));
  return { x:finite(patch.x) + Math.cos(a) * r, z:finite(patch.z) + Math.sin(a) * r };
}
function decorate(root, index) {
  root.traverse(node => Object.assign(node.userData ||= {}, { skipRaycast:true, skipOctree:true, noOctree:true, villageDecor:true, chaiForestTree:true, proceduralCoreTree:true, forestIndex:index }));
  return root;
}
export function createForestField(op = {}, heightAt = () => 0) {
  const patches = op.patches?.length ? op.patches : [{ x:0, z:0, radius:72 }];
  const requested = Math.floor(finite(op.count, DEFAULT_MAX_PROCEDURAL_TREES));
  const cap = Math.max(6, Math.min(Math.floor(finite(op.maxProceduralTrees, DEFAULT_MAX_PROCEDURAL_TREES)), DEFAULT_MAX_PROCEDURAL_TREES));
  const count = Math.max(6, Math.min(requested, cap));
  const seed = finite(op.seed, 121);
  const group = new THREE.Group(); group.name = op.name || "ChaiForestField_procedural_core_capped_real_trees";
  const barkUrl = namedTexture(ACTUAL_TEXTURES.bark, true), leafUrl = namedTexture(ACTUAL_TEXTURES.leaf, true);
  for (let i = 0; i < count; i += 1) {
    const p = point(pick(patches, seed, i), seed, i);
    const scale = finite(op.scale, .58) * (.52 + hash(i, seed, 7) * .26);
    const tree = createHeroTree({ name:`chai_procedural_core_tree_${i}`, kind:kindFor(seed, i), variant:i % 4, x:p.x, y:heightAt(p.x, p.z), z:p.z, scale, rotationY:hash(i, seed, 11) * Math.PI * 2, barkMapUrl:barkUrl, leafMapUrl:leafUrl }, {});
    decorate(tree, i); group.add(tree);
  }
  Object.assign(group.userData, { lodForest:{ requested, count, maxProceduralTrees:cap, drawCallsEstimate:count * 2, generatorPath:"/libs/awtsmoos-procedural-core/src/core/geometry/generators/tree/treeGenerator.js", chaiForestTextures:[ACTUAL_TEXTURES.bark, ACTUAL_TEXTURES.leaf], noConeTrees:true, noSphereTrees:true, workerSafeBitmapTextures:true, densityReducedForFps:true } });
  return markDecorative(group);
}
export default createForestField;
