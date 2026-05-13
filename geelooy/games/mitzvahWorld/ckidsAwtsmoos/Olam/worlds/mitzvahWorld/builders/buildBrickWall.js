
/**
 * @fileoverview
 * ════════════════════════════════════════════════════════════════════════
 * B"H
 *
 *   THE WALL OF HOLY SEPARATION — buildBrickWall.js
 *   ──────────────────────────────────────────────────
 *   "And you shall build a wall..." — boundaries are holy.
 *   The Gevurah energy, the left column of the Tree of Life,
 *   is not cruelty — it is the sacred border that preserves identity.
 *
 *   Without walls, everything bleeds into everything.
 *   With holy walls, each thing is what it IS.
 *   The Chassid stays IN. The Kelipah stays OUT.
 *
 *   Each brick is its own InstancedMesh entry — two colors alternating
 *   in the ancient running-bond pattern, offset every row by half a brick.
 *   A single static compound collider wraps the whole wall.
 *
 *   "Stone by stone they shall rebuild" — and so we do, programmatically,
 *   one instance matrix at a time, glory upon glory.
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
 *   Two materials (colorA, colorB) alternate per row for visual richness.
 *   A single static box collider covers the entire wall extent.
 *
 *   The wall grows along the X-axis, rows stacking in Y.
 *   Rotate the parent def to orient it in Z via def.rotation.
 *
 * @param   {THREE.Scene}   scene   - The living scene
 * @param   {Object|null}   physics - Physics world
 * @param   {import('../nivrayimDefs.js').NefeshDef} def - Soul blueprint
 * @param   {Object|null}   olam    - Olam context for octree insertion
 * @returns {Promise<THREE.Group[]>}  A single Group containing both InstancedMeshes
 */
export async function buildBrickWall(scene, physics, def, olam = null) {
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

  // Trim to actual counts
  meshA.count = countA;
  meshB.count = countB;
  meshA.instanceMatrix.needsUpdate = true;
  meshB.instanceMatrix.needsUpdate = true;

  // ── Group & transform ────────────────────────────────────────────────
  const group = new THREE.Group();
  group.add(meshA, meshB);
  group.position.set(px, py, pz);
  group.rotation.set(rx, ry, rz);
  group.name = def.id;

  // ── Octree (Collision Boundary) ─────────────────────────────────────
  if (olam?.worldOctree) {
    const wallW = bricksX * brickW;
    const wallH = bricksY * brickH;
    const proxyGeo = new THREE.BoxGeometry(wallW, wallH, brickD);
    const proxyMesh = new THREE.Mesh(proxyGeo);
    // Center of the wall in local group space is roughly offset by the col/row logic
    // But since the group handles the position/rotation, we just need the relative bounds.
    // The current loop centers the bricks around local 0,0,0
    proxyMesh.position.set(0, (wallH / 2) - (brickH / 2), 0); 
    group.add(proxyMesh);
    proxyMesh.visible = false; // Hide the proxy
    
    olam.worldOctree.fromGraphNode(proxyMesh);
  }

  // ── Physics: one static box for the whole wall ───────────────────────
  if (physics && def.props?.physics) {
    const wallW = (bricksX * brickW) / 2;
    const wallH = (bricksY * brickH) / 2;
    _addStaticBoxToPhysics(physics, px, py + wallH, pz, wallW, wallH, brickD / 2);
  }

  return [group];
}

/**
 * @function _addStaticBoxToPhysics
 * @description
 *   Duck-typed static box registration.
 *   "The wall stands firm because the Awtsmoos wills it" —
 *   no matter which physics library you use, the wall shall not fall.
 *
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
      const R = physics.RAPIER;
      const body = physics.world.createRigidBody(R.RigidBodyDesc.fixed().setTranslation(x, y, z));
      physics.world.createCollider(R.ColliderDesc.cuboid(hx, hy, hz), body);
    }
  } catch (e) {
    console.error('B"H - buildBrickWall physics error:', e);
  }
}
