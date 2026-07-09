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

import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";
import { assembleRoom } from './RoomAssembler.js?compact=true&v=full-chain-cache-bust-20260708-bh10';
import { getMaterial } from '../materials/MaterialFactory.js?compact=true&v=full-chain-cache-bust-20260708-bh10';

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
  if (layout.length > 0) {
    const box = new THREE.Box3().setFromObject(group);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3()).sub(group.position);
    const roofW = Math.max(8, size.x + 1.0), roofD = Math.max(7, size.z + 1.0), roofRise = Math.max(1.0, roofW * 0.16);
    const roofShape = new THREE.Shape();
    roofShape.moveTo(-roofW / 2, 0);
    roofShape.lineTo(0, roofRise);
    roofShape.lineTo(roofW / 2, 0);
    roofShape.lineTo(-roofW / 2, 0);
    const roofGeo = new THREE.ExtrudeGeometry(roofShape, { depth:roofD, bevelEnabled:false });
    roofGeo.translate(0, 0, -roofD / 2);
    const roofMesh = new THREE.Mesh(roofGeo, roofMat);
    roofMesh.position.set(center.x, box.max.y - group.position.y, center.z);
    roofMesh.name = `${def.id}_layout_gable_roof`;
    roofMesh.castShadow = true;
    roofMesh.userData.isSolid = true;
    group.add(roofMesh);
  }

  return [group];
}
