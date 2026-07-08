// B"H
/** Lightweight Chai Forest tree builder for the gameplay path. */
import * as THREE from '/games/scripts/build/three.module.js';
import { ACTUAL_TEXTURES, namedTexture } from '../../../../../geelooy/libs/awtsmoosCinematicWorld/assets/ChaiForestStaticAssets.js';
import { progressiveMaterialMap } from '../../../../../geelooy/libs/awtsmoosCinematicWorld/materials/ProgressiveTextureLoader.js';

function material(color, textureName, repeat) {
  const mat = new THREE.MeshLambertMaterial({ color, transparent: false });
  progressiveMaterialMap(THREE, mat, namedTexture(textureName, true), { repeat, fallback: color === 0x6b4424 ? [107, 68, 36, 255] : [56, 128, 54, 255] });
  mat.userData.chaiForestTextureName = textureName;
  mat.userData.progressiveUpgradeOnly = true;
  return mat;
}

const trunkGeo = new THREE.CylinderGeometry(0.46, 0.68, 1, 8);
const canopyGeo = new THREE.ConeGeometry(1, 1, 8, 1);
const shadowGeo = new THREE.CircleGeometry(1, 18);

export async function buildTree(scene, physics, def, olam = null) {
  const props = def.props || {}, height = props.height || 7, trunkRadius = props.trunkRadius || 0.35;
  const foliageRadius = props.foliageRadius || 2.2;
  const [px, py, pz] = def.position || [0, 0, 0], [rx, ry, rz] = def.rotation || [0, 0, 0], [sx, sy, sz] = def.scale || [1, 1, 1];
  const group = new THREE.Group(); group.position.set(px, py, pz); group.rotation.set(rx, ry, rz); group.scale.set(sx, sy, sz); group.name = def.id || 'chai_forest_tree';
  Object.assign(group.userData, { nefeshType: 'tree', chaiForestTree: true, noOldTreeGenerator: true, progressiveChaiTextures: true });
  const trunkMat = material(0x6b4424, ACTUAL_TEXTURES.bark, { x: 1, y: 2.5 });
  const leafMat = material(props.leafColor || 0x388036, ACTUAL_TEXTURES.leaf, { x: 1.6, y: 1.6 });
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.name = 'chai_tree_bark_trunk_progressive';
  trunk.position.y = height / 2;
  trunk.scale.set(trunkRadius / 0.68, height, trunkRadius / 0.68);
  trunk.castShadow = false; trunk.receiveShadow = true; trunk.userData.isSolid = true; group.add(trunk);
  for (let i = 0; i < 3; i += 1) {
    const canopy = new THREE.Mesh(canopyGeo, leafMat);
    canopy.name = `chai_tree_leaf_canopy_progressive_${i}`;
    canopy.position.y = height * (0.56 + i * 0.13);
    canopy.rotation.y = i * Math.PI / 3;
    canopy.scale.set(foliageRadius * (1.12 - i * 0.17), height * 0.22, foliageRadius * (1.12 - i * 0.17));
    canopy.castShadow = false; canopy.receiveShadow = true; canopy.userData.isGeneratedFoliage = false; group.add(canopy);
  }
  const shadow = new THREE.Mesh(shadowGeo, new THREE.MeshBasicMaterial({ color: 0x10250f, transparent: true, opacity: 0.16, depthWrite: false }));
  shadow.name = 'chai_tree_ground_shadow_lightweight';
  shadow.rotation.x = -Math.PI / 2;
  shadow.scale.set(foliageRadius * 1.15, foliageRadius * 0.72, 1);
  shadow.position.y = 0.012;
  shadow.userData.skipOctree = true; shadow.userData.noOctree = true; group.add(shadow);
  return [group];
}
export default buildTree;
