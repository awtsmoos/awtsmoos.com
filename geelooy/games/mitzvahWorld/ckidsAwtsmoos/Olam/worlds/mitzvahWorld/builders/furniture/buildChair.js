/**
 * B"H
 * ════════════════════════════════════════════════════════════════════════
 *   THE CHAIR OF SITTING — buildChair.js
 *   ────────────────────────────────────────
 *   A place for the Chossid to rest and learn.
 * ════════════════════════════════════════════════════════════════════════
 */

import * as THREE from '/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { makeWall, makePillar } from '../wallUtils.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

export async function buildChair(scene, physics, def, olam = null) {
  const { color = 0x4e342e, scale = 1 } = def.props || {};
  const [px, py, pz] = def.position || [0, 0, 0];
  const mat = new THREE.MeshLambertMaterial({ color });
  const group = new THREE.Group();
  group.position.set(px, py, pz);
  group.scale.set(scale, scale, scale);

  const seatH = 0.45;
  const seatW = 0.45;
  
  // Seat
  makeWall(group, mat, 0, seatH, 0, seatW, 0.05, seatW, olam);
  
  // Back
  makeWall(group, mat, 0, seatH + 0.3, -seatW/2, seatW, 0.6, 0.05, olam);
  
  // Legs
  const legR = 0.03;
  const ox = seatW / 2 - 0.05;
  const oz = seatW / 2 - 0.05;
  makePillar(group, mat,  ox, seatH / 2,  oz, legR, seatH, olam);
  makePillar(group, mat, -ox, seatH / 2,  oz, legR, seatH, olam);
  makePillar(group, mat,  ox, seatH / 2, -oz, legR, seatH, olam);
  makePillar(group, mat, -ox, seatH / 2, -oz, legR, seatH, olam);

  return [group];
}
