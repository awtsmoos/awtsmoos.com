/**
 * B"H
 * ════════════════════════════════════════════════════════════════════════
 *   THE PINNACLE OF KETER — buildCrown.js
 *   ────────────────────────────────────────
 *   The rooftop crown and spire of the skyscraper.
 * ════════════════════════════════════════════════════════════════════════
 */

import * as THREE from '/games/scripts/build/three.module.js?compact=true&v=full-chain-cache-bust-20260708-bh10';

/**
 * @function buildCrown
 * @param {THREE.Group} group
 * @param {Object} props
 */
export function buildCrown(group, props) {
  const { totalH, width, depth, accentMat, floorHeight } = props;

  // ── Roof slab ──
  const roofGeo  = new THREE.BoxGeometry(width + 0.5, 0.4, depth + 0.5);
  const roofMesh = new THREE.Mesh(roofGeo, accentMat);
  roofMesh.position.set(0, totalH + 0.2, 0);
  roofMesh.castShadow = true;
  roofMesh.userData.isSolid = true;
  group.add(roofMesh);

  // ── Crown spire ──
  const spireGeo  = new THREE.CylinderGeometry(0.15, 0.4, floorHeight * 0.8, 8);
  const spireMesh = new THREE.Mesh(spireGeo, accentMat);
  spireMesh.position.set(0, totalH + 0.4 + floorHeight * 0.4, 0);
  spireMesh.castShadow = true;
  spireMesh.userData.isSolid = true;
  group.add(spireMesh);
}
