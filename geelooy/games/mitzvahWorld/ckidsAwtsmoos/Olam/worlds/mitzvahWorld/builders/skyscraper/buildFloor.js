/**
 * B"H
 * ════════════════════════════════════════════════════════════════════════
 *   A LEVEL OF ASCENT — buildFloor.js
 *   ────────────────────────────────────────
 *   A single story of the skyscraper tower.
 * ════════════════════════════════════════════════════════════════════════
 */

import { makeWall, makeWindow } from '../wallUtils.js';

/**
 * @function buildFloor
 * @param {THREE.Group} group
 * @param {Object} props
 */
export function buildFloor(group, props) {
  const {
    baseY, floorHeight, width, depth, wallMat, accentMat, glassColor, t
  } = props;

  const hw = width / 2;
  const hd = depth / 2;
  const mh = floorHeight / 2;
  const cy = baseY + mh;

  // Four walls per floor
  makeWall(group, wallMat, 0, cy, -hd, width, floorHeight, t);   // North
  makeWall(group, wallMat, 0, cy,  hd, width, floorHeight, t);   // South
  makeWall(group, wallMat, hw, cy, 0, t, floorHeight, depth);    // East
  makeWall(group, wallMat, -hw, cy, 0, t, floorHeight, depth);   // West

  // Floor slab (with hollow center for elevator)
  const holeW = width * 0.4;
  const holeD = depth * 0.4;
  const slabW = (width - holeW) / 2;
  const slabD = (depth - holeD) / 2;

  makeWall(group, accentMat, 0, baseY, -(hd - slabD / 2), width, 0.2, slabD); // North slab
  makeWall(group, accentMat, 0, baseY, (hd - slabD / 2), width, 0.2, slabD);  // South slab
  makeWall(group, accentMat, (hw - slabW / 2), baseY, 0, slabW, 0.2, holeD); // East slab
  makeWall(group, accentMat, -(hw - slabW / 2), baseY, 0, slabW, 0.2, holeD); // West slab

  // Windows
  const winY = cy + 0.1;
  makeWindow(group, -hw * 0.35, winY, -hd - 0.01, 0.7, floorHeight * 0.55, 'z', glassColor);
  makeWindow(group,  hw * 0.35, winY, -hd - 0.01, 0.7, floorHeight * 0.55, 'z', glassColor);
  makeWindow(group, -hw * 0.35, winY,  hd + 0.01, 0.7, floorHeight * 0.55, 'z', glassColor);
  makeWindow(group,  hw * 0.35, winY,  hd + 0.01, 0.7, floorHeight * 0.55, 'z', glassColor);
}
