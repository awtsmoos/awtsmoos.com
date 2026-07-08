/**
 * B"H
 * ════════════════════════════════════════════════════════════════════════
 *   THE OUTER SHELL — buildHall.js
 *   ────────────────────────────────────────
 *   The walls and dome of the sanctuary hall.
 * ════════════════════════════════════════════════════════════════════════
 */

import * as THREE from '/games/scripts/build/three.module.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import { makeWall, makeWindow, makePillar } from '../wallUtils.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

export function buildHall(group, props) {
  const { width, depth, wallHeight, wallMat, domeMat, t, mh } = props;
  const hw = width / 2;
  const hd = depth / 2;

  // Walls
  makeWall(group, wallMat, 0, mh, -hd, width, wallHeight, t);     // North
  makeWall(group, wallMat, hw, mh, 0, t, wallHeight, depth);      // East
  makeWall(group, wallMat, -hw, mh, 0, t, wallHeight, depth);     // West
  
  // South Wall (Entrance)
  const doorW = 3;
  const sideW = (width - doorW) / 2;
  makeWall(group, wallMat, -(hw - sideW / 2), mh, hd, sideW, wallHeight, t);
  makeWall(group, wallMat,  (hw - sideW / 2), mh, hd, sideW, wallHeight, t);
  makeWall(group, wallMat, 0, wallHeight - 1, hd, doorW, 2, t);

  // Columns
  const colR = 0.3;
  makePillar(group, wallMat, hw - 2, mh, hd - 4, colR, wallHeight);
  makePillar(group, wallMat, -hw + 2, mh, hd - 4, colR, wallHeight);
  makePillar(group, wallMat, hw - 2, mh, -hd + 4, colR, wallHeight);
  makePillar(group, wallMat, -hw + 2, mh, -hd + 4, colR, wallHeight);

  // Dome
  const domeGeo = new THREE.SphereGeometry(hw, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
  const domeMesh = new THREE.Mesh(domeGeo, domeMat);
  domeMesh.position.set(0, wallHeight, 0);
  domeMesh.castShadow = true;
  domeMesh.userData.isSolid = true;
  group.add(domeMesh);
}
