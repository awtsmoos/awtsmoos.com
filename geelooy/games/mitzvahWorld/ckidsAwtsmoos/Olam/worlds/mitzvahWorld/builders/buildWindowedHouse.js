/**
 * B"H
 * ════════════════════════════════════════════════════════════════════════
 *   THE HOUSE OF WINDOWS — buildWindowedHouse.js
 *   ──────────────────────────────────────────────
 *   A multi-story dwelling designed to let in the light of the sun,
 *   just as the soul is designed to let in the light of the Awtsmoos.
 *
 *   Architecture: Stackable floors with windows on each face.
 * ════════════════════════════════════════════════════════════════════════
 * @module buildWindowedHouse
 */

import * as THREE from '/games/scripts/build/three.module.js';
import { makeWall, makeFloor, makeWindow } from './wallUtils.js';
import { getMaterial } from '../materials/MaterialFactory.js';

/**
 * @function buildWindowedHouse
 * @param {THREE.Scene}  scene
 * @param {Object|null}  physics
 * @param {Object}       def
 * @param {Object|null}  olam
 * @returns {Promise<THREE.Group[]>}
 */
export async function buildWindowedHouse(scene, physics, def, olam = null) {
  const {
    materialName = 'JERUSALEM_STONE',
    wallColor,
    roofColor,
    floorColor,
    width      = 8,
    depth      = 6,
    wallHeight = 3,
    stories    = 2,
  } = def.props || {};

  const [px, py, pz] = def.position || [0, 0, 0];
  const t = 0.3;

  const wallMat  = getMaterial(materialName, wallColor ? { color: wallColor } : {});
  const roofMat  = getMaterial('RED_BRICK', roofColor ? { color: roofColor } : {});
  const floorMat = getMaterial('DARK_WOOD', floorColor ? { color: floorColor } : {});

  const group = new THREE.Group();
  group.position.set(px, py, pz);
  group.name = def.id;

  const hw = width / 2;
  const hd = depth / 2;
  const totalH = wallHeight * stories;

  // ── Build each story ──
  for (let s = 0; s < stories; s++) {
    const baseY = s * wallHeight;
    const mh = wallHeight / 2;
    const cy = baseY + mh;

    // Walls
    makeWall(group, wallMat, 0, cy, -hd, width, wallHeight, t, olam);   // North
    makeWall(group, wallMat, 0, cy,  hd, width, wallHeight, t, olam);   // South
    makeWall(group, wallMat, hw, cy, 0, t, wallHeight, depth, olam);    // East
    makeWall(group, wallMat, -hw, cy, 0, t, wallHeight, depth, olam);   // West

    // Intermediate floors
    if (s > 0) {
      makeFloor(group, floorMat, baseY, width, depth, olam);
    }

    // Windows
    const winY = cy + 0.2;
    makeWindow(group, -hw * 0.4, winY, -hd - 0.01, 1.2, 1.2, 'z');
    makeWindow(group,  hw * 0.4, winY, -hd - 0.01, 1.2, 1.2, 'z');
    makeWindow(group, hw + 0.01, winY, 0, 1.5, 1.2, 'x');
    makeWindow(group, -hw - 0.01, winY, 0, 1.5, 1.2, 'x');
  }

  // ── Gable roof ──
  const roofShape = new THREE.Shape();
  const roofW = width + 0.8, roofD = depth + 0.8, roofRise = Math.max(0.9, width * 0.18);
  roofShape.moveTo(-roofW / 2, 0);
  roofShape.lineTo(0, roofRise);
  roofShape.lineTo(roofW / 2, 0);
  roofShape.lineTo(-roofW / 2, 0);
  const roofGeo = new THREE.ExtrudeGeometry(roofShape, { depth:roofD, bevelEnabled:false });
  roofGeo.translate(0, 0, -roofD / 2);
  const roofMesh = new THREE.Mesh(roofGeo, roofMat);
  roofMesh.position.set(0, totalH, 0);
  roofMesh.name = `${def.id}_clean_gable_roof`;
  roofMesh.castShadow = true;
  roofMesh.userData.isSolid = true;
  group.add(roofMesh);

  // ── Porch overhang ──
  const porchGeo  = new THREE.BoxGeometry(width * 0.4, 0.1, 2);
  const porchMesh = new THREE.Mesh(porchGeo, roofMat);
  porchMesh.position.set(0, wallHeight * 0.9, hd + 1);
  group.add(porchMesh);

  return [group];
}
