/**
 * B"H
 * ════════════════════════════════════════════════════════════════════════
 *   THE TREE OF LIFE — buildTree.js
 *   ────────────────────────────────────────
 *   A procedural tree with realistic trunk, branches,
 *   and instanced leaf clusters.
 * ════════════════════════════════════════════════════════════════════════
 */

import * as THREE from '/games/scripts/build/three.module.js';
import { getMaterial } from '../materials/MaterialFactory.js';

export async function buildTree(scene, physics, def, olam = null) {
  const { 
    height = 6, 
    trunkRadius = 0.3, 
    foliageRadius = 2.5,
    leafCount = 100 
  } = def.props || {};

  const [px, py, pz] = def.position || [0, 0, 0];
  const group = new THREE.Group();
  group.position.set(px, py, pz);
  group.name = def.id;

  const trunkMat = getMaterial('DARK_WOOD');
  const leafMat = new THREE.MeshLambertMaterial({ 
    color: 0x228b22, 
    side: THREE.DoubleSide 
  });

  // ── 1. The Trunk ──
  const trunkGeo = new THREE.CylinderGeometry(trunkRadius * 0.7, trunkRadius, height, 8);
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.y = height / 2;
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  trunk.userData.isSolid = true;
  group.add(trunk);

  // ── 2. The Leaf Clusters (Instanced for Performance) ──
  const leafShape = new THREE.Shape();
  leafShape.moveTo(0, 0);
  leafShape.bezierCurveTo(0.1, 0.1, 0.2, 0.4, 0, 0.6);
  leafShape.bezierCurveTo(-0.2, 0.4, -0.1, 0.1, 0, 0);
  
  const leafGeo = new THREE.ShapeGeometry(leafShape);
  leafGeo.translate(0, -0.3, 0); // Center pivot

  const leafMesh = new THREE.InstancedMesh(leafGeo, leafMat, leafCount);
  leafMesh.position.y = height * 0.8;
  group.add(leafMesh);

  const dummy = new THREE.Object3D();
  for (let i = 0; i < leafCount; i++) {
    const r = Math.random() * foliageRadius;
    const phi = Math.acos(2 * Math.random() - 1);
    const theta = Math.random() * Math.PI * 2;

    dummy.position.set(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(phi) * Math.sin(theta),
      r * Math.cos(phi)
    );
    dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
    dummy.scale.setScalar(0.5 + Math.random() * 1.5);
    dummy.updateMatrix();
    leafMesh.setMatrixAt(i, dummy.matrix);
  }

  leafMesh.instanceMatrix.needsUpdate = true;

  return [group];
}
