/**
 * B"H
 * ════════════════════════════════════════════════════════════════════════
 *   THE TABLE OF SETTING — buildTable.js
 *   ────────────────────────────────────────
 *   A place for a holy meal.
 * ════════════════════════════════════════════════════════════════════════
 */

import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";
import { makeWall, makePillar } from '../wallUtils.js?compact=true&v=full-chain-cache-bust-20260708-bh10';

export async function buildTable(scene, physics, def, olam = null) {
  const { width = 2, depth = 1.2, height = 0.8, color = 0x5d4037 } = def.props || {};
  const [px, py, pz] = def.position || [0, 0, 0];
  const mat = new THREE.MeshLambertMaterial({ color });
  const group = new THREE.Group();
  group.position.set(px, py, pz);

  // Top
  makeWall(group, mat, 0, height, 0, width, 0.1, depth, olam);

  // Legs
  const legR = 0.05;
  const legH = height;
  const ox = width / 2 - 0.1;
  const oz = depth / 2 - 0.1;
  makePillar(group, mat,  ox, legH / 2,  oz, legR, legH, olam);
  makePillar(group, mat, -ox, legH / 2,  oz, legR, legH, olam);
  makePillar(group, mat,  ox, legH / 2, -oz, legR, legH, olam);
  makePillar(group, mat, -ox, legH / 2, -oz, legR, legH, olam);

  return [group];
}
