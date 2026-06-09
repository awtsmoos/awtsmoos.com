/**
 * B"H
 * @file buildTree.js
 * @description
 * Chapter 171: The active Emerald trees awaken with roots, bark scars, layered
 * crowns, fruit sparks, and shadowed branches. The Awtsmoos makes every trunk
 * a standing sentence, every leaf a green letter, every orchard a doorway.
 */
import * as THREE from '/games/scripts/build/three.module.js';
import { getMaterial } from '../materials/MaterialFactory.js';
function safeMaterial(name, color) { try { return getMaterial(name) || new THREE.MeshLambertMaterial({ color }); } catch { return new THREE.MeshLambertMaterial({ color }); } }
function lambert(color) { return new THREE.MeshLambertMaterial({ color }); }
function addBranch(group, from, to, radius, material, name = 'branch') {
  const direction = new THREE.Vector3().subVectors(to, from), length = direction.length();
  const midpoint = new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5);
  const geo = new THREE.CylinderGeometry(radius * 0.48, radius, length, 9);
  const branch = new THREE.Mesh(geo, material);
  branch.name = name;
  branch.position.copy(midpoint);
  branch.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize());
  branch.castShadow = true; branch.receiveShadow = true; branch.userData.isSolid = true;
  group.add(branch);
}
function addFoliageCluster(group, center, radius, material, index) {
  const cluster = new THREE.Mesh(new THREE.IcosahedronGeometry(radius, 2), material);
  cluster.name = `layered_leaf_cluster_${index}`;
  cluster.position.copy(center);
  cluster.scale.set(1.18 + (index % 2) * 0.12, 0.78 + (index % 3) * 0.08, 1.03);
  cluster.rotation.set(index * 0.19, index * 0.33, index * 0.08);
  cluster.castShadow = true; cluster.receiveShadow = true; cluster.userData.isGeneratedFoliage = true;
  group.add(cluster);
}
function addRoots(group, radius, mat) {
  for (let i = 0; i < 8; i += 1) {
    const a = i * Math.PI * 2 / 8;
    addBranch(group, new THREE.Vector3(0, 0.12, 0), new THREE.Vector3(Math.cos(a) * radius * 2.7, -0.03, Math.sin(a) * radius * 2.7), radius * 0.22, mat, `visible_root_${i}`);
  }
}
function addBarkScars(group, height, radius) {
  const mat = lambert(0x3a2416);
  for (let i = 0; i < 7; i += 1) {
    const scar = new THREE.Mesh(new THREE.BoxGeometry(radius * 0.75, 0.055, 0.03), mat);
    scar.name = `bark_shadow_scar_${i}`;
    scar.position.set(Math.sin(i) * radius * 0.22, height * (0.16 + i * 0.095), radius * 0.98);
    scar.rotation.set(0, i * 0.7, 0.08 * Math.sin(i));
    group.add(scar);
  }
}
function addFruit(group, centers, scale) {
  const mats = [lambert(0xd8492e), lambert(0xe5b84b), lambert(0x7c4bc0)];
  centers.slice(0, 7).forEach((center, i) => {
    const fruit = new THREE.Mesh(new THREE.SphereGeometry(scale * 0.055, 10, 8), mats[i % mats.length]);
    fruit.name = `emerald_tree_fruit_spark_${i}`;
    fruit.position.copy(center).add(new THREE.Vector3(Math.sin(i) * scale * 0.22, -scale * 0.12, Math.cos(i) * scale * 0.18));
    group.add(fruit);
  });
}
function crownCenters(height, foliageRadius, branchCount) {
  const centers = [];
  for (let i = 0; i < branchCount; i += 1) {
    const angle = i / branchCount * Math.PI * 2;
    const reach = foliageRadius * (0.72 + i % 3 * 0.13);
    const y = height * (0.58 + i % 4 * 0.065);
    centers.push(new THREE.Vector3(Math.cos(angle) * reach, y + height * 0.14, Math.sin(angle) * reach));
  }
  centers.push(new THREE.Vector3(0, height * 0.93, 0), new THREE.Vector3(foliageRadius * 0.38, height * 0.78, foliageRadius * 0.22), new THREE.Vector3(-foliageRadius * 0.42, height * 0.81, -foliageRadius * 0.24));
  return centers;
}
export async function buildTree(scene, physics, def, olam = null) {
  const props = def.props || {}, height = props.height || 7, trunkRadius = props.trunkRadius || 0.35;
  const foliageRadius = props.foliageRadius || 2.2, branchCount = props.branchCount || 8;
  const [px, py, pz] = def.position || [0, 0, 0], [rx, ry, rz] = def.rotation || [0, 0, 0], [sx, sy, sz] = def.scale || [1, 1, 1];
  const group = new THREE.Group(); group.position.set(px, py, pz); group.rotation.set(rx, ry, rz); group.scale.set(sx, sy, sz); group.name = def.id || 'generated_tree';
  Object.assign(group.userData, { isGeneratedModel: true, nefeshType: 'tree' });
  const trunkMat = safeMaterial('DARK_WOOD', 0x6b3f1d), leafA = lambert(props.leafColor || 0x2f8f3a), leafB = lambert(props.leafColor2 || 0x62bb4d), shadowLeaf = lambert(0x246b2f);
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(trunkRadius * 0.52, trunkRadius, height, 11), trunkMat);
  trunk.position.y = height / 2; trunk.castShadow = true; trunk.receiveShadow = true; trunk.userData.isSolid = true; group.add(trunk);
  addRoots(group, trunkRadius, trunkMat); addBarkScars(group, height, trunkRadius);
  const centers = crownCenters(height, foliageRadius, branchCount);
  centers.slice(0, branchCount).forEach((to, i) => addBranch(group, new THREE.Vector3(0, height * (0.42 + i % 4 * 0.065), 0), to, trunkRadius * 0.24, trunkMat, `readable_living_branch_${i}`));
  centers.forEach((center, i) => addFoliageCluster(group, center, foliageRadius * (i < branchCount ? 0.45 : 0.66), i % 3 === 0 ? shadowLeaf : i % 2 ? leafB : leafA, i));
  addFruit(group, centers, foliageRadius);
  return [group];
}
export default buildTree;
