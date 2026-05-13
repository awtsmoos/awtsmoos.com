/**
 * B"H
 * ════════════════════════════════════════════════════════════════════════
 *   THE HOUSE OF ASSEMBLY — buildBeisHaKnesses.js
 *   ────────────────────────────────────────────────
 *   Refactored into a modular Seder Hishtalshelus.
 * ════════════════════════════════════════════════════════════════════════
 * @module buildBeisHaKnesses
 */

import * as THREE from '/games/scripts/build/three.module.js';
import { buildHall } from './beisHaKnesses/buildHall.js';
import { buildSanctuary } from './beisHaKnesses/buildSanctuary.js';
import { getMaterial } from '../materials/MaterialFactory.js';

/**
 * @function buildBeisHaKnesses
 */
export async function buildBeisHaKnesses(scene, physics, def, olam = null) {
  const {
    width       = 15,
    depth       = 20,
    wallHeight  = 8,
  } = def.props || {};

  const [px, py, pz] = def.position || [0, 0, 0];
  const t = 0.5;
  const mh = wallHeight / 2;

  const wallMat = getMaterial('JERUSALEM_STONE');
  const domeMat = getMaterial('SKY_GLASS', { opacity: 0.4 });
  const woodMat = getMaterial('DARK_WOOD');

  const group = new THREE.Group();
  group.position.set(px, py, pz);
  group.name = def.id;

  // ── Build Hall ──
  buildHall(group, { width, depth, wallHeight, wallMat, domeMat, t, mh });

  // ── Build Sanctuary ──
  buildSanctuary(group, { width, depth, woodMat, t });

  return [group];
}
