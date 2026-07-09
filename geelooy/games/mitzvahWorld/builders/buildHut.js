/**
 * @fileoverview
 * ════════════════════════════════════════════════════════════════════════
 * B"H
 *
 *   THE DWELLING PLACE — buildHut.js
 *   ──────────────────────────────────
 *   "Make Me a sanctuary and I will dwell among them." — Shemos 25:8
 *   Four walls. A roof. A door gap facing south.
 *
 *   TIKKUN: `from 'three'` → absolute path (blob:/Worker-safe).
 *   The hut walls now load, scene.add() succeeds, and NivrahFactory
 *   seals them into the octree so the Chassid bounces off them.
 *
 * ════════════════════════════════════════════════════════════════════════
 *
 * @module buildHut
 */

import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";

/**
 * @function buildHut
 * @description
 *   Erects a simple hut: four BoxGeometry walls, a ConeGeometry roof.
 *   South wall has a gap for the entrance door.
 *   Physics: static box per wall via _addStaticBox (Rapier or custom).
 *
 * @param   {THREE.Scene}   scene
 * @param   {Object|null}   physics
 * @param   {import('../nivrayimDefs.js').NefeshDef} def
 * @returns {Promise<THREE.Group[]>}
 */
export async function buildHut(scene, physics, def) {
  const {
    wallColor  = 0xf5deb3,
    roofColor  = 0x8b2500,
    width      = 6,
    depth      = 6,
    wallHeight = 3,
  } = def.props || {};

  const [px, py, pz] = def.position || [0, 0, 0];
  const t = 0.3; // wall thickness

  const wallMat = new THREE.MeshLambertMaterial({ color: wallColor });
  const roofMat = new THREE.MeshLambertMaterial({ color: roofColor });

  const group = new THREE.Group();
  group.position.set(px, py, pz);
  group.name = def.id;

  /**
   * @function _wall
   * @description Creates one wall mesh, adds to group, registers physics box.
   * @param {number} wx @param {number} wy @param {number} wz
   * @param {number} ww @param {number} wh @param {number} wd
   * @returns {void}
   */
  const _wall = (wx, wy, wz, ww, wh, wd) => {
    const geo  = new THREE.BoxGeometry(ww, wh, wd);
    const mesh = new THREE.Mesh(geo, wallMat);
    mesh.position.set(wx, wy, wz);
    mesh.castShadow = mesh.receiveShadow = true;
    group.add(mesh);

    if (physics) {
      _addStaticBox(physics, px + wx, py + wy, pz + wz, ww / 2, wh / 2, wd / 2);
    }
  };

  const halfW = width / 2;
  const halfD = depth / 2;
  const midH  = wallHeight / 2;

  // North wall (full)
  _wall(0,     midH, -halfD, width, wallHeight, t);
  // South wall — two half-walls with a door gap
  const doorW = 1.2;
  const sideW = (width - doorW) / 2;
  _wall(-(halfW - sideW / 2), midH, halfD, sideW, wallHeight, t);
  _wall( (halfW - sideW / 2), midH, halfD, sideW, wallHeight, t);
  // East wall
  _wall( halfW, midH, 0, t, wallHeight, depth);
  // West wall
  _wall(-halfW, midH, 0, t, wallHeight, depth);

  // Roof
  const roofGeo  = new THREE.ConeGeometry(
    Math.max(halfW, halfD) * 1.3,
    wallHeight * 0.6,
    4,
  );
  const roofMesh = new THREE.Mesh(roofGeo, roofMat);
  roofMesh.position.set(0, wallHeight + (wallHeight * 0.3), 0);
  roofMesh.rotation.y = Math.PI / 4;
  roofMesh.castShadow = true;
  group.add(roofMesh);

  return [group];
}

/**
 * @function _addStaticBox
 * @description Duck-typed static box for Rapier or custom physics APIs.
 * @param {Object} physics
 * @param {number} x @param {number} y @param {number} z
 * @param {number} hx @param {number} hy @param {number} hz
 * @returns {void}
 */
function _addStaticBox(physics, x, y, z, hx, hy, hz) {
  try {
    if (typeof physics.addStaticBox === 'function') {
      physics.addStaticBox({ x, y, z }, { hx, hy, hz });
    } else if (physics.world?.createRigidBody) {
      const R    = physics.RAPIER;
      const body = physics.world.createRigidBody(R.RigidBodyDesc.fixed().setTranslation(x, y, z));
      physics.world.createCollider(R.ColliderDesc.cuboid(hx, hy, hz), body);
    }
  } catch (e) {
    console.error('B"H - buildHut physics error:', e);
  }
}