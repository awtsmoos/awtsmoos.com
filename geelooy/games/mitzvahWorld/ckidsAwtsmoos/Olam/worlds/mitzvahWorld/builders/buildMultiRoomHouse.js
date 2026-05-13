/**
 * B"H
 * ════════════════════════════════════════════════════════════════════════
 *   THE REVELATION OF INTERIORS — buildMultiRoomHouse.js
 *   ──────────────────────────────────────────────────────
 *   This builder no longer relies on hardcoded L-shapes.
 *   It is a pure data-interpreter that assembles rooms from a layout.
 * ════════════════════════════════════════════════════════════════════════
 * @module buildMultiRoomHouse
 */

import * as THREE from '/games/scripts/build/three.module.js';
import { assembleRoom } from './RoomAssembler.js';
import { getMaterial } from '../materials/MaterialFactory.js';

/**
 * @function buildMultiRoomHouse
 */
export async function buildMultiRoomHouse(scene, physics, def, olam = null) {
  const {
    materialName = 'JERUSALEM_STONE',
    layout = [], // B"H: The extreme data-based insanity
  } = def.props || {};

  const [px, py, pz] = def.position || [0, 0, 0];
  const wallMat = getMaterial(materialName);
  const floorMat = getMaterial('DARK_WOOD');
  const roofMat = getMaterial('RED_BRICK');

  const group = new THREE.Group();
  group.position.set(px, py, pz);
  group.name = def.id;

  const materials = { wallMat, floorMat };

  // ── 1. Build Rooms ──
  for (const roomDef of layout) {
    await assembleRoom(group, roomDef, materials, olam);
  }

  // ── 2. Unified Roof (Calculated from bounding box of rooms) ──
  // For now, we'll just add a large flat slab for simplicity,
  // or the layout could specify a roof.
  if (layout.length > 0) {
    const roofGeo = new THREE.BoxGeometry(20, 0.4, 15);
    const roofMesh = new THREE.Mesh(roofGeo, roofMat);
    roofMesh.position.set(0, 3.7, 0);
    roofMesh.castShadow = true;
    roofMesh.userData.isSolid = true;
    group.add(roofMesh);
  }

  return [group];
}
