/**
 * B"H
 * ════════════════════════════════════════════════════════════════════════
 *   THE ASSEMBLER OF SPACES — RoomAssembler.js
 *   ────────────────────────────────────────────
 *   Updated to utilize the Universal Geometry Engine.
 * ════════════════════════════════════════════════════════════════════════
 */

import * as THREE from '/games/scripts/build/three.module.js';
import { makeWall, makeFloor, makeWindow } from '../wallUtils.js';
import { GeometryEngine } from '../GeometryEngine.js';
import { FURNITURE_BLUEPRINTS } from '../data/manifests/FurnitureManifest.js';

/**
 * @function assembleRoom
 */
export async function assembleRoom(parentGroup, roomDef, materials, olam = null) {
  const { wallMat, floorMat } = materials;
  const { position, size, walls = {}, furniture = [] } = roomDef;
  const [rx, ry, rz] = position;
  const [rw, rh, rd] = size;
  const t = 0.2;

  const roomGroup = new THREE.Group();
  roomGroup.position.set(rx, ry, rz);
  parentGroup.add(roomGroup);

  const hw = rw / 2;
  const hd = rd / 2;
  const mh = rh / 2;

  // ── 1. Floor ──
  makeFloor(roomGroup, floorMat, 0, rw, rd, olam);

  // ── 2. Walls ──
  if (!walls.north?.hidden) {
    makeWall(roomGroup, wallMat, 0, mh, -hd, rw, rh, t, olam);
    if (walls.north?.hasWindow) makeWindow(roomGroup, 0, mh, -hd - 0.01, 1, 1, 'z');
  }
  if (!walls.south?.hidden) {
    const doorW = walls.south?.hasDoor ? 1.2 : 0;
    if (doorW > 0) {
      const sideW = (rw - doorW) / 2;
      makeWall(roomGroup, wallMat, -(hw - sideW / 2), mh, hd, sideW, rh, t, olam);
      makeWall(roomGroup, wallMat,  (hw - sideW / 2), mh, hd, sideW, rh, t, olam);
      makeWall(roomGroup, wallMat, 0, rh - 0.5, hd, doorW, 1, t, olam);
    } else {
      makeWall(roomGroup, wallMat, 0, mh, hd, rw, rh, t, olam);
    }
  }
  if (!walls.east?.hidden) makeWall(roomGroup, wallMat, hw, mh, 0, t, rh, rd, olam);
  if (!walls.west?.hidden) makeWall(roomGroup, wallMat, -hw, mh, 0, t, rh, rd, olam);

  // ── 3. Furniture (Pure Data Engine) ──
  for (const item of furniture) {
    const blueprint = FURNITURE_BLUEPRINTS[item.type];
    if (blueprint) {
      const furnitureGroup = GeometryEngine.manifest(blueprint, { 
        vars: item.props, 
        olam 
      });
      const [ix, iy, iz] = item.position || [0,0,0];
      furnitureGroup.position.set(ix, iy, iz);
      roomGroup.add(furnitureGroup);
    }
  }
}
