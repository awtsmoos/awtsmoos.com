// B"H
/** Hero tree wrapper: procedural-core geometry plus worker-safe Chai textures. */
import * as THREE from "/games/scripts/build/three.module.js";
import { finite } from "../math.js";
import { markDecorative } from "../decor.js";
import { createProceduralCoreTree } from "/games/mitzvahWorld/ckidsAwtsmoos/Olam/worlds/mitzvahWorld/region/trees/ProceduralCoreTreeFactory.js?v=chai-procedural-core-tree-20260707-bh2";
import { ACTUAL_TEXTURES, namedTexture } from "/games/mitzvahWorld/geelooy/libs/awtsmoosCinematicWorld/assets/ChaiForestStaticAssets.js";
import { progressiveMaterialMap } from "/games/mitzvahWorld/geelooy/libs/awtsmoosCinematicWorld/materials/ProgressiveTextureLoader.js";

const kindFor = v => /pine|cedar/i.test(v) ? "pine" : /apple/i.test(v) ? "apple" : /willow/i.test(v) ? "willow" : "oak";
function applyChai(THREE, root, op = {}) {
  const bark = op.barkMapUrl || namedTexture(ACTUAL_TEXTURES.bark, true);
  const leaf = op.leafMapUrl || namedTexture(ACTUAL_TEXTURES.leaf, true);
  root.traverse(node => {
    if (!node?.isMesh || !node.material) return;
    const n = `${node.name}`.toLowerCase();
    if (n.includes("branch")) progressiveMaterialMap(THREE, node.material, bark, { repeat:{ x:op.barkRepeatX || 2, y:op.barkRepeatY || 5 }, fallback:[90, 54, 28, 255] });
    if (n.includes("leaf")) { node.material.side = THREE.DoubleSide; node.material.alphaTest = Math.max(node.material.alphaTest || 0, .22); progressiveMaterialMap(THREE, node.material, leaf, { repeat:{ x:1, y:1 }, fallback:[46, 128, 42, 255] }); }
    Object.assign(node.userData ||= {}, { chaiForestTexture:true, workerSafeBitmapTexture:true, noOldBlobTree:true });
  });
  Object.assign(root.userData ||= {}, { proceduralCoreTree:true, chaiForestTree:true, generatorPath:"/libs/awtsmoos-procedural-core/src/core/geometry/generators/tree/treeGenerator.js", textureNames:[ACTUAL_TEXTURES.bark, ACTUAL_TEXTURES.leaf] });
  return root;
}
export function createHeroTree(op = {}, ctx = {}) {
  const kind = kindFor(op.kind || op.species || "oak");
  const tree = createProceduralCoreTree(kind, Math.floor(finite(op.variant, finite(op.seed, 0))) % 4);
  const group = new THREE.Group(); group.name = op.name || "AwtsmoosHeroTree_procedural_core_chai";
  group.add(applyChai(THREE, tree, op));
  group.position.set(finite(op.position?.x, finite(op.x, 0)), finite(op.position?.y, finite(op.y, 0)), finite(op.position?.z, finite(op.z, 0)));
  group.rotation.y = finite(op.rotationY, 0); group.scale.setScalar(finite(op.scale, 1));
  Object.assign(group.userData, { proceduralCoreHeroTree:true, chaiForestTree:true, noConeTree:true, noSphereTree:true, rendererPresent:!!(ctx.renderer || ctx.olam?.renderer) });
  return markDecorative(group);
}
export default createHeroTree;
