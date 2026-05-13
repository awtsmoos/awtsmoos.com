/**
 * B"H
 * ════════════════════════════════════════════════════════════════════════
 *   THE DWELLING PLACE — buildHut.js
 *   ──────────────────────────────────
 *   "Make Me a sanctuary and I will dwell among them." — Shemos 25:8
 *
 *   Even the simplest hut is a Mishkan in miniature.
 *   Four walls. A roof. A door gap facing south (toward warmth).
 *   Inside: the potential for holiness, for learning, for prayer.
 *
 *   Architecture: 4 wall boxes + 1 pyramidal roof (ConeGeometry).
 *   All walls registered with the worldOctree through wallUtils.
 * ════════════════════════════════════════════════════════════════════════
 * @module buildHut
 */

import * as THREE from '/games/scripts/build/three.module.js';
import { makeWall } from './wallUtils.js';

/**
 * @function buildHut
 * @param {THREE.Scene}  scene
 * @param {Object|null}  physics
 * @param {Object}       def
 * @param {Object|null}  olam - Olam context for octree insertion
 * @returns {Promise<THREE.Group[]>}
 */
export async function buildHut(scene, physics, def, olam = null) {
  const {
    wallColor  = 0xf5deb3,
    roofColor  = 0x8b2500,
    width      = 6,
    depth      = 6,
    wallHeight = 3,
  } = def.props || {};

  const [px, py, pz] = def.position || [0, 0, 0];
  const t = 0.3;

  const wallMat = new THREE.MeshLambertMaterial({ color: wallColor });
  const roofMat = new THREE.MeshLambertMaterial({ color: roofColor });

  const group = new THREE.Group();
  group.position.set(px, py, pz);
  group.name = def.id;

  const hw = width / 2;
  const hd = depth / 2;
  const mh = wallHeight / 2;

  // ── Walls (all registered with octree via wallUtils) ──
  makeWall(group, wallMat, 0, mh, -hd, width, wallHeight, t, olam);     // North
  makeWall(group, wallMat, hw, mh, 0, t, wallHeight, depth, olam);      // East
  makeWall(group, wallMat, -hw, mh, 0, t, wallHeight, depth, olam);     // West
  // South: two halves with door gap
  const doorW = 1.2;
  const sideW = (width - doorW) / 2;
  makeWall(group, wallMat, -(hw - sideW / 2), mh, hd, sideW, wallHeight, t, olam);
  makeWall(group, wallMat,  (hw - sideW / 2), mh, hd, sideW, wallHeight, t, olam);

  // ── Roof ──
  const roofGeo  = new THREE.ConeGeometry(
    Math.max(hw, hd) * 1.3,
    wallHeight * 0.6,
    4,
  );
  const roofMesh = new THREE.Mesh(roofGeo, roofMat);
  roofMesh.position.set(0, wallHeight + (wallHeight * 0.3), 0);
  roofMesh.rotation.y = Math.PI / 4;
  roofMesh.castShadow = true;
  roofMesh.userData.isSolid = true; // B"H: Peaked roof is solid
  group.add(roofMesh);

  return [group];
}
