// B"H
/** Chai forest field: procedural-core tree geometry, cached materials, no cone/blob generator. */
import * as THREE from "/games/scripts/build/three.module.js";
import { finite, hash } from "../math.js";
import { markDecorative } from "../decor.js";
import { createHeroTree } from "../tree/heroTree.js?v=procedural-core-chai-worker-safe-20260707-bh2";
import { ACTUAL_TEXTURES, namedTexture } from "/games/mitzvahWorld/geelooy/libs/awtsmoosCinematicWorld/assets/ChaiForestStaticAssets.js";

function chooseKind(seed, i) {
  const r = hash(i, seed, 8);
  return r < .25 ? "pine" : r < .48 ? "willow" : r < .7 ? "apple" : "oak";
}
function point(patch, seed, i) {
  const a = hash(i, seed, 1) * Math.PI * 2, r = finite(patch.radius, 30) * Math.sqrt(hash(i, seed, 2));
  return { x:finite(patch.x) + Math.cos(a) * r, z:finite(patch.z) + Math.sin(a) * r };
}
function pick(patches, seed, i) { return patches[Math.floor(hash(i, seed, 4) * patches.length)] || { x:0, z:0, radius:42 }; }
function decorateTree(tree) {
  tree.traverse(node => Object.assign(node.userData ||= {}, { skipRaycast:true, skipOctree:true, noOctree:true, villageDecor:true, chaiForestTree:true, proceduralCoreTree:true }));
  return tree;
}
export function createForestField(op = {}, heightAt = () => 0) {
  const patches = op.patches?.length ? op.patches : [{ x:0, z:0, radius:72 }];
  const requested = Math.floor(finite(op.count, 72));
  const count = Math.max(8, Math.min(requested, finite(op.maxProceduralTrees, 54)));
  const seed = finite(op.seed, 121), group = new THREE.Group();
  group.name = op.name || "ChaiForestField_procedural_core_real_trees";
  for (let i = 0; i < count; i += 1) {
    const p = point(pick(patches, seed, i), seed, i);
    const scale = finite(op.scale, .72) * (.62 + hash(i, seed, 7) * .36);
    const tree = createHeroTree({ name:`chai_procedural_core_tree_${i}`, kind:chooseKind(seed, i), variant:i % 4, x:p.x, y:heightAt(p.x, p.z), z:p.z, scale, rotationY:hash(i, seed, 9) * Math.PI * 2, barkMapUrl:namedTexture(ACTUAL_TEXTURES.bark, true), leafMapUrl:namedTexture(ACTUAL_TEXTURES.leaf, true) }, {});
    decorateTree(tree); group.add(tree);
  }
  group.userData.lodForest = { count, drawCallsEstimate:count * 2, generatorPath:"/libs/awtsmoos-procedural-core/src/core/geometry/generators/tree/treeGenerator.js", chaiForestTextures:[ACTUAL_TEXTURES.bark, ACTUAL_TEXTURES.leaf], noConeTrees:true, noSphereTrees:true, workerSafeBitmapTextures:true };
  return markDecorative(group);
}
export default createForestField;
