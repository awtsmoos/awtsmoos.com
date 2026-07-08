/**
 * B"H
 * ════════════════════════════════════════════════════════════════════════
 *   THE BRICKS OF GEVURAH — wallUtils.js
 *   ────────────────────────────────────────
 *   Shared utilities for all structure builders.
 *   Every wall, floor, and ceiling in the Mitzvah World flows through here,
 *   guaranteeing that the Octree (the cosmic boundary ledger) always knows
 *   about every solid surface the Awtsmoos has willed into existence.
 *
 *   "The foundation stones of the wall of the city were adorned
 *    with every kind of precious stone" — Revelation 21:19
 *    So too, every BoxGeometry wall is adorned with collision data.
 * ════════════════════════════════════════════════════════════════════════
 * @module wallUtils
 */

import * as THREE from '/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

/**
 * @function makeWall
 * @description
 *   Creates a single wall mesh (BoxGeometry), adds it to the parent group.
 *
 * @param {THREE.Group}           group    - Parent group to attach to
 * @param {THREE.Material}        material - The wall material
 * @param {number} wx - Local X position
 * @param {number} wy - Local Y position
 * @param {number} wz - Local Z position
 * @param {number} ww - Width
 * @param {number} wh - Height
 * @param {number} wd - Depth
 * @param {Object|null} olam - Olam context
 * @returns {THREE.Mesh} The created wall mesh
 */
export function makeWall(group, material, wx, wy, wz, ww, wh, wd, olam = null) {
  const geo  = new THREE.BoxGeometry(ww, wh, wd);
  const mesh = new THREE.Mesh(geo, material);
  mesh.position.set(wx, wy, wz);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.userData.isSolid = true; // B"H: Mark as physical reality
  group.add(mesh);
  return mesh;
}

/**
 * @function makeFloor
 * @description
 *   Creates a thin floor slab and registers it as solid.
 */
export function makeFloor(group, material, fy, fw, fd, olam = null) {
  return makeWall(group, material, 0, fy, 0, fw, 0.2, fd, olam);
}

/**
 * @function makeWindow
 * @description
 *   Cuts a visual "window" into a wall. NOT solid.
 */
export function makeWindow(group, wx, wy, wz, ww, wh, face = 'z', glassColor = 0x87ceeb) {
  const geo = new THREE.PlaneGeometry(ww, wh);
  const mat = new THREE.MeshLambertMaterial({
    color: glassColor,
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(wx, wy, wz);
  if (face === 'x') {
    mesh.rotation.y = Math.PI / 2;
  }
  group.add(mesh);
  return mesh;
}

/**
 * @function makeStairs
 * @description
 *   Generates a set of steps for vertical ascent.
 */
export function makeStairs(group, material, sx, sy, sz, width, height, depth, steps, olam = null) {
  const stairGroup = new THREE.Group();
  stairGroup.position.set(sx, sy, sz);
  group.add(stairGroup);

  const stepH = height / steps;
  const stepD = depth / steps;

  for (let i = 0; i < steps; i++) {
    const wy = (i * stepH) + stepH / 2;
    const wz = (i * stepD) + stepD / 2;
    makeWall(stairGroup, material, 0, wy, wz, width, stepH * 2, stepD, olam);
  }

  return stairGroup;
}

/**
 * @function makePillar
 * @description Creates a support pillar (CylinderGeometry).
 */
export function makePillar(group, material, px, py, pz, radius, height, olam = null) {
  const geo = new THREE.CylinderGeometry(radius, radius, height, 16);
  const mesh = new THREE.Mesh(geo, material);
  mesh.position.set(px, py, pz);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.userData.isSolid = true; // B"H: Mark as physical reality
  group.add(mesh);
  return mesh;
}

export default { makeWall, makeFloor, makeWindow, makeStairs, makePillar };
