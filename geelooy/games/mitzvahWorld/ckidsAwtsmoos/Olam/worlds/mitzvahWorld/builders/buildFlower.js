/**
 * B"H
 * ════════════════════════════════════════════════════════════════════════
 *   THE BLOSSOM OF BEAUTY — buildFlower.js
 *   ────────────────────────────────────────
 *   A data-driven flower builder with custom petal geometry.
 * ════════════════════════════════════════════════════════════════════════
 */

import * as THREE from '/games/scripts/build/three.module.js';

export async function buildFlower(scene, physics, def, olam = null) {
  const { 
    petalColor = 0xff69b4, 
    centerColor = 0xffff00,
    petalCount = 6,
    height = 0.5 
  } = def.props || {};

  const [px, py, pz] = def.position || [0, 0, 0];
  const group = new THREE.Group();
  group.position.set(px, py, pz);

  const stemMat = new THREE.MeshLambertMaterial({ color: 0x228b22 });
  const petalMat = new THREE.MeshLambertMaterial({ color: petalColor, side: THREE.DoubleSide });
  const centerMat = new THREE.MeshLambertMaterial({ color: centerColor });

  // ── 1. The Stem ──
  const stemGeo = new THREE.CylinderGeometry(0.02, 0.03, height, 8);
  const stem = new THREE.Mesh(stemGeo, stemMat);
  stem.position.y = height / 2;
  group.add(stem);

  // ── 2. The Center ──
  const centerGeo = new THREE.SphereGeometry(0.1, 8, 8);
  const center = new THREE.Mesh(centerGeo, centerMat);
  center.position.y = height;
  group.add(center);

  // ── 3. The Petals ──
  const petalShape = new THREE.Shape();
  petalShape.moveTo(0, 0);
  petalShape.quadraticCurveTo(0.15, 0.2, 0, 0.4);
  petalShape.quadraticCurveTo(-0.15, 0.2, 0, 0);
  
  const petalGeo = new THREE.ShapeGeometry(petalShape);
  petalGeo.rotateX(-Math.PI / 4);

  for (let i = 0; i < petalCount; i++) {
    const p = new THREE.Mesh(petalGeo, petalMat);
    p.position.y = height;
    p.rotation.y = (i / petalCount) * Math.PI * 2;
    group.add(p);
  }

  return [group];
}
