// B"H
/**
 * @file treeRecipe.js
 * @description
 * Chapter 171: the toy tree is dismissed and the library forest enters.
 * The Awtsmoos led us to `geelooy/libs/awtsmoos3d/tree/heroTree.js`; now the
 * village anchor tree is a full generated hero tree: flared trunk, instanced
 * limbs, hundreds of leaves, root braces, and no raycast burden for NPC hover.
 */
import * as THREE from "/games/scripts/build/three.module.js";
import { createHeroTree } from "/libs/awtsmoos3d/tree/heroTree.js?v=village-hero-tree-20260612-bh1";

function markTree(root) {
  root.traverse?.(child => {
    child.userData ||= {};
    Object.assign(child.userData, { villageDecor: true, skipRaycast: true, skipOctree: true, noOctree: true, generatedHeroTree: true });
    child.castShadow = false;
    child.receiveShadow = true;
  });
  return root;
}
function brace(group, name, angle, color = 0x4b2a14) {
  const geo = new THREE.CylinderGeometry(0.09, 0.18, 2.1, 8, 1);
  const mat = new THREE.MeshLambertMaterial({ color });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.name = name;
  mesh.position.set(Math.cos(angle) * 0.72, 0.58, Math.sin(angle) * 0.72);
  mesh.rotation.set(0.92, 0, -angle + Math.PI / 2);
  group.add(mesh);
}
function rootHalo(group) {
  for (let i = 0; i < 12; i += 1) brace(group, `hero_tree_root_brace_${i}`, i * Math.PI * 2 / 12, i % 2 ? 0x5e351b : 0x3a2111);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.48, 0.045, 8, 36), new THREE.MeshLambertMaterial({ color: 0x376d2c }));
  ring.name = "moss_ring_at_hero_tree_base";
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.035;
  group.add(ring);
}

export function pictureAnchorTree(options = {}) {
  const group = new THREE.Group();
  group.name = options.name || "pictureAnchorTree_full_library_hero_tree";
  const hero = createHeroTree({
    name: "generated_awtsmoos_library_oak",
    trunkHeight: options.trunkHeight || 8.2,
    crownRadius: options.crownRadius || 5.9,
    crownHeight: options.crownHeight || 4.2,
    limbCount: options.limbCount || 42,
    leafCount: options.leafCount || 620,
    barkColor: options.barkColor || 0x67401f,
    branchColor: options.branchColor || 0x3f2413,
    leafColor: options.leafColor || 0x4d9b37,
    scale: options.scale || 1,
    rotationY: options.rotationY || 0,
    position: { x: 0, y: 0, z: 0 }
  }, options.context || {});
  rootHalo(group);
  group.add(hero);
  markTree(group);
  return group;
}
