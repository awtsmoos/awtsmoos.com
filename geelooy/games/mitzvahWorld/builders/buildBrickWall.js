/**
 * @fileoverview
 * ════════════════════════════════════════════════════════════════════════
 * B"H
 *
 *   THE WALL OF HOLY SEPARATION — buildBrickWall.js
 *   ──────────────────────────────────────────────────
 *   "And you shall build a wall..." — boundaries are holy.
 *   Each brick is its own InstancedMesh entry — two colors alternating
 *   in the ancient running-bond pattern.
 *
 *   TIKKUN: `from 'three'` → absolute path (blob:/Worker-safe).
 *
 * ════════════════════════════════════════════════════════════════════════
 *
 * @module buildBrickWall
 */

import * as THREE from '/games/scripts/build/three.module.js';

const _DUMMY = new THREE.Object3D();

/**
 * @function buildBrickWall
 * @description
 *   Constructs a running-bond brick wall using InstancedMesh.
 *   Two materials alternate per row. One static box collider covers the whole wall.
 *
 * @param   {THREE.Scene}   scene
 * @param   {Object|null}   physics
 * @param   {import('../nivrayimDefs.js').NefeshDef} def
 * @returns {Promise<THREE.Group[]>}
 */
export async function buildBrickWall(scene, physics, def) {
  const {
    bricksX  = 10,
    bricksY  = 3,
    brickW   = 2,
    brickH   = 1,
    brickD   = 0.5,
    colorA   = 0xb5651d,
    colorB   = 0x8b4513,
  } = def.props || {};

  const [px, py, pz] = def.position || [0, 0, 0];
  const [rx, ry, rz] = def.rotation || [0, 0, 0];

  const totalBricks = bricksX * bricksY;
  const gap = 0.05;

  const geoA = new THREE.BoxGeometry(brickW - gap, brickH - gap, brickD - gap);
  const geoB = new THREE.BoxGeometry(brickW - gap, brickH - gap, brickD - gap);
  const matA = new THREE.MeshLambertMaterial({ color: colorA });
  const matB = new THREE.MeshLambertMaterial({ color: colorB });

  const meshA = new THREE.InstancedMesh(geoA, matA, totalBricks);
  const meshB = new THREE.InstancedMesh(geoB, matB, totalBricks);
  meshA.castShadow = meshB.castShadow = true;
  meshA.receiveShadow = meshB.receiveShadow = true;

  let countA = 0;
  let countB = 0;

  for (let row = 0; row < bricksY; row++) {
    const offset = (row % 2 === 0) ? 0 : brickW / 2;
    for (let col = 0; col < bricksX; col++) {
      const bx = (col * brickW) - (bricksX * brickW / 2) + offset;
      const by = row * brickH;

      _DUMMY.position.set(bx, by, 0);
      _DUMMY.rotation.set(0, 0, 0);
      _DUMMY.scale.set(1, 1, 1);
      _DUMMY.updateMatrix();

      const useA = (row + col) % 2 === 0;
      if (useA) {
        meshA.setMatrixAt(countA++, _DUMMY.matrix);
      } else {
        meshB.setMatrixAt(countB++, _DUMMY.matrix);
      }
    }
  }

  meshA.count = countA;
  meshB.count = countB;
  meshA.instanceMatrix.needsUpdate = true;
  meshB.instanceMatrix.needsUpdate = true;

  const group = new THREE.Group();
  group.add(meshA, meshB);
  group.position.set(px, py, pz);
  group.rotation.set(rx, ry, rz);
  group.name = def.id;

  if (physics && def.props?.physics) {
    const wallW = bricksX * brickW / 2;
    const wallH = bricksY * brickH / 2;
    _addStaticBoxToPhysics(physics, px, py + wallH, pz, wallW, wallH, brickD / 2);
  }

  return [group];
}

/**
 * @function _addStaticBoxToPhysics
 * @param {Object} physics
 * @param {number} x @param {number} y @param {number} z
 * @param {number} hx @param {number} hy @param {number} hz
 * @returns {void}
 */
function _addStaticBoxToPhysics(physics, x, y, z, hx, hy, hz) {
  try {
    if (typeof physics.addStaticBox === 'function') {
      physics.addStaticBox({ x, y, z }, { hx, hy, hz });
    } else if (physics.world?.createRigidBody) {
      const R    = physics.RAPIER;
      const body = physics.world.createRigidBody(R.RigidBodyDesc.fixed().setTranslation(x, y, z));
      physics.world.createCollider(R.ColliderDesc.cuboid(hx, hy, hz), body);
    }
  } catch (e) {
    console.error('B"H - buildBrickWall physics error:', e);
  }
}