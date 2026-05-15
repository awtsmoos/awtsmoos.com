/**
 * B"H
 * @file buildTree.js
 * @description
 * Procedural 3D tree builder. No flat billboard leaves: trunks, branch arms,
 * and layered solid foliage clumps are generated at runtime.
 */

import * as THREE from '/games/scripts/build/three.module.js';
import { getMaterial } from '../materials/MaterialFactory.js';

/**
 * B"H
 * Creates a material with a safe fallback.
 *
 * @param {string} name Material key.
 * @param {number} color Fallback color.
 * @returns {THREE.Material} Material.
 */
function safeMaterial(name, color) {
  try {
    return getMaterial(name) || new THREE.MeshLambertMaterial({ color });
  } catch {
    return new THREE.MeshLambertMaterial({ color });
  }
}

/**
 * B"H
 * Adds one cylindrical branch between two local-space points.
 *
 * @param {THREE.Group} group Parent group.
 * @param {THREE.Vector3} from Start.
 * @param {THREE.Vector3} to End.
 * @param {number} radius Branch radius.
 * @param {THREE.Material} material Branch material.
 * @returns {void}
 */
function addBranch(group, from, to, radius, material) {
  const direction = new THREE.Vector3().subVectors(to, from);
  const length = direction.length();
  const midpoint = new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5);

  const geo = new THREE.CylinderGeometry(radius * 0.55, radius, length, 8);
  const branch = new THREE.Mesh(geo, material);
  branch.position.copy(midpoint);
  branch.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    direction.clone().normalize()
  );
  branch.castShadow = true;
  branch.receiveShadow = true;
  branch.userData.isSolid = true;
  group.add(branch);
}

/**
 * B"H
 * Adds clustered 3D foliage.
 *
 * @param {THREE.Group} group Parent group.
 * @param {THREE.Vector3} center Center.
 * @param {number} radius Radius.
 * @param {THREE.Material} material Leaf material.
 * @returns {void}
 */
function addFoliageCluster(group, center, radius, material) {
  const clusterGeo = new THREE.IcosahedronGeometry(radius, 2);
  const cluster = new THREE.Mesh(clusterGeo, material);
  cluster.position.copy(center);
  cluster.scale.set(1.15, 0.85, 1.05);
  cluster.castShadow = true;
  cluster.receiveShadow = true;
  cluster.userData.isGeneratedFoliage = true;
  group.add(cluster);
}

/**
 * B"H
 * Builds a full generated tree.
 *
 * @param {THREE.Scene} scene Scene.
 * @param {Object|null} physics Physics.
 * @param {Object} def Tree definition.
 * @param {Object|null} olam World.
 * @returns {Promise<THREE.Object3D[]>} Tree roots.
 */
export async function buildTree(scene, physics, def, olam = null) {
  const {
    height = 7,
    trunkRadius = 0.35,
    foliageRadius = 2.2,
    branchCount = 7,
    leafColor = 0x2f8f3a,
    leafColor2 = 0x58b957
  } = def.props || {};

  const [px, py, pz] = def.position || [0, 0, 0];
  const [rx, ry, rz] = def.rotation || [0, 0, 0];
  const [sx, sy, sz] = def.scale || [1, 1, 1];

  const group = new THREE.Group();
  group.position.set(px, py, pz);
  group.rotation.set(rx, ry, rz);
  group.scale.set(sx, sy, sz);
  group.name = def.id || 'generated_tree';
  group.userData.isGeneratedModel = true;
  group.userData.nefeshType = 'tree';

  const trunkMat = safeMaterial('DARK_WOOD', 0x6b3f1d);
  const leafMat = new THREE.MeshLambertMaterial({ color: leafColor });
  const leafMat2 = new THREE.MeshLambertMaterial({ color: leafColor2 });

  const trunkGeo = new THREE.CylinderGeometry(trunkRadius * 0.55, trunkRadius, height, 10);
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.y = height / 2;
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  trunk.userData.isSolid = true;
  group.add(trunk);

  const crownCenters = [];

  for (let i = 0; i < branchCount; i++) {
    const angle = (i / branchCount) * Math.PI * 2;
    const branchLength = foliageRadius * (0.75 + (i % 3) * 0.15);
    const startY = height * (0.45 + (i % 4) * 0.08);
    const from = new THREE.Vector3(0, startY, 0);
    const to = new THREE.Vector3(
      Math.cos(angle) * branchLength,
      startY + height * 0.16,
      Math.sin(angle) * branchLength
    );

    addBranch(group, from, to, trunkRadius * 0.26, trunkMat);
    crownCenters.push(to);
  }

  crownCenters.push(new THREE.Vector3(0, height * 0.92, 0));
  crownCenters.push(new THREE.Vector3(foliageRadius * 0.35, height * 0.78, foliageRadius * 0.25));
  crownCenters.push(new THREE.Vector3(-foliageRadius * 0.35, height * 0.8, -foliageRadius * 0.2));

  crownCenters.forEach((center, index) => {
    const radius = foliageRadius * (index < branchCount ? 0.48 : 0.68);
    addFoliageCluster(group, center, radius, index % 2 ? leafMat2 : leafMat);
  });

  return [group];
}

export default buildTree;
