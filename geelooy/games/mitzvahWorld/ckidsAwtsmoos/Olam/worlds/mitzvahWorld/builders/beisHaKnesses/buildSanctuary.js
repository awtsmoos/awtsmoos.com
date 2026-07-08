/**
 * B"H
 * ════════════════════════════════════════════════════════════════════════
 *   THE HOLY VESSELS — buildSanctuary.js
 *   ────────────────────────────────────────
 *   The Aron Kodesh and the Bimah.
 * ════════════════════════════════════════════════════════════════════════
 */

import { makeWall, makeStairs } from '../wallUtils.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

export function buildSanctuary(group, props) {
  const { width, depth, woodMat, t } = props;
  const hd = depth / 2;

  // ── The Aron Kodesh (Holy Ark) ──
  const aronW = 3;
  const aronH = 5;
  const aronD = 1;
  makeWall(group, woodMat, 0, aronH / 2, -hd + aronD / 2 + t, aronW, aronH, aronD);
  
  // ── The Bimah (Platform) ──
  const bimahW = 4;
  const bimahD = 4;
  const bimahH = 0.5;
  makeWall(group, woodMat, 0, bimahH / 2, 0, bimahW, bimahH, bimahD);
  makeStairs(group, woodMat, 0, 0, bimahD / 2, bimahW, bimahH, 1, 3);
}
