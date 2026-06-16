// B"H
/** @file ThreeSkinnedMeshAdapter.js @description Skinned vessels are born here, not in animal domain files. */
import * as THREE from "/games/scripts/build/three.module.js";
export function createThreeSkinnedMesh({ geometry, material, skeletonPack, name = "awtsmoos_skinned_mesh" } = {}) {
  const mesh = new THREE.SkinnedMesh(geometry, material);
  mesh.name = name; mesh.castShadow = true; mesh.receiveShadow = true;
  if (skeletonPack && skeletonPack.rootBone) mesh.add(skeletonPack.rootBone);
  if (skeletonPack && skeletonPack.skeleton) mesh.bind(skeletonPack.skeleton);
  mesh.userData.awtsmoosSkinnedMesh = true;
  mesh.userData.boneCount = skeletonPack && skeletonPack.bones ? skeletonPack.bones.length : 0;
  mesh.userData.skinAttributeProof = Boolean(geometry && geometry.attributes && geometry.attributes.skinIndex && geometry.attributes.skinWeight);
  return mesh;
}
export default createThreeSkinnedMesh;
