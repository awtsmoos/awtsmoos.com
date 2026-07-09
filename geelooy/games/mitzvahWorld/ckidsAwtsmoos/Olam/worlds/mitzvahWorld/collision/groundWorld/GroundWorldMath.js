// B"H
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";

/**
 * Purpose: shared math vessels for mesh-ground authority.
 * Owner: GroundCollisionWorld.
 * Inputs: numeric query values and terrain meshes.
 * Outputs: stable numbers, ids, and reused Three.js objects.
 * Runtime authority: no mutable game state is owned here.
 * Performance: module-level objects avoid per-frame allocations.
 * Update order: loaded before the ground world facade.
 * Callers: GroundCollisionWorld and helper modules.
 * Calls: Three.js primitives only.
 * Invariants: DOWN is always world negative Y.
 * Failure modes: non-finite values collapse to provided fallback.
 * Future: replace random fallback id with build-time ids.
 */
export const DOWN = new THREE.Vector3(0, -1, 0);
export const RAYCASTER = new THREE.Raycaster();
export const BOX = new THREE.Box3();
export const NORMAL_MATRIX = new THREE.Matrix3();

export function finite(value, fallback = 0) {
  return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

export function meshId(mesh) {
  return mesh?.uuid || mesh?.name || `terrain_${Math.random().toString(36).slice(2)}`;
}
