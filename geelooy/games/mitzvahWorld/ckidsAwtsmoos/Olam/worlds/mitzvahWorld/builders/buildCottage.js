/**
 * B"H
 * ════════════════════════════════════════════════════════════════════════
 *   THE COTTAGE OF WARMTH — buildCottage.js
 *   ──────────────────────────────────────────
 *   A cozy single-room dwelling with a peaked roof,
 *   a chimney peeking toward the heavens, and windows on every side.
 *   The simplest shelter — Avraham's tent in polygon form.
 * ════════════════════════════════════════════════════════════════════════
 * @module buildCottage
 */

import * as THREE from '/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { makeWall, makeWindow } from './wallUtils.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

/**
 * @function buildCottage
 * @param {THREE.Scene}  scene
 * @param {Object|null}  physics
 * @param {Object}       def
 * @param {Object|null}  olam
 * @returns {Promise<THREE.Group[]>}
 */
export async function buildCottage(scene, physics, def, olam = null) {
  const {
    wallColor  = 0xdeb887,
    roofColor  = 0x654321,
    trimColor  = 0xf5f5dc,
    width      = 5,
    depth      = 4,
    wallHeight = 2.5,
  } = def.props || {};

  const [px, py, pz] = def.position || [0, 0, 0];
  const t = 0.25;

  const wallMat = new THREE.MeshLambertMaterial({ color: wallColor });
  const roofMat = new THREE.MeshLambertMaterial({ color: roofColor });
  const trimMat = new THREE.MeshLambertMaterial({ color: trimColor });

  const group = new THREE.Group();
  group.position.set(px, py, pz);
  group.name = def.id;

  const hw = width / 2;
  const hd = depth / 2;
  const mh = wallHeight / 2;

  // ── Walls ──
  makeWall(group, wallMat, 0, mh, -hd, width, wallHeight, t, olam);     // North
  makeWall(group, wallMat, hw, mh, 0, t, wallHeight, depth, olam);      // East
  makeWall(group, wallMat, -hw, mh, 0, t, wallHeight, depth, olam);     // West
  // South: two halves with door gap
  const doorW = 1.0;
  const sideW = (width - doorW) / 2;
  makeWall(group, wallMat, -(hw - sideW / 2), mh, hd, sideW, wallHeight, t, olam);
  makeWall(group, wallMat,  (hw - sideW / 2), mh, hd, sideW, wallHeight, t, olam);

  // ── Windows ──
  makeWindow(group, 0, mh + 0.3, -hd - 0.01, 0.8, 0.7, 'z');
  makeWindow(group, hw + 0.01, mh + 0.3, 0, 0.8, 0.7, 'x');
  makeWindow(group, -hw - 0.01, mh + 0.3, 0, 0.8, 0.7, 'x');

  // ── Roof (triangular prism via ExtrudeGeometry) ──
  const roofShape = new THREE.Shape();
  const roofOverhang = 0.4;
  roofShape.moveTo(-(hw + roofOverhang), 0);
  roofShape.lineTo(0, wallHeight * 0.5);
  roofShape.lineTo(hw + roofOverhang, 0);
  roofShape.lineTo(-(hw + roofOverhang), 0);

  const roofGeo = new THREE.ExtrudeGeometry(roofShape, {
    depth: depth + roofOverhang * 2,
    bevelEnabled: false,
  });
  const roofMesh = new THREE.Mesh(roofGeo, roofMat);
  roofMesh.position.set(0, wallHeight, -(hd + roofOverhang));
  roofMesh.castShadow = true;
  roofMesh.userData.isSolid = true;
  group.add(roofMesh);

  // ── Chimney ──
  const chimGeo = new THREE.BoxGeometry(0.5, 1.2, 0.5);
  const chimMesh = new THREE.Mesh(chimGeo, trimMat);
  chimMesh.position.set(hw * 0.5, wallHeight + wallHeight * 0.4, -hd * 0.3);
  chimMesh.castShadow = true;
  chimMesh.userData.isSolid = true;
  group.add(chimMesh);

  // ── Door frame ──
  const frameMesh = new THREE.Mesh(
    new THREE.BoxGeometry(doorW + 0.2, wallHeight * 0.85, t + 0.05),
    trimMat
  );
  frameMesh.position.set(0, wallHeight * 0.42, hd);
  frameMesh.userData.isSolid = true;
  group.add(frameMesh);

  return [group];
}
