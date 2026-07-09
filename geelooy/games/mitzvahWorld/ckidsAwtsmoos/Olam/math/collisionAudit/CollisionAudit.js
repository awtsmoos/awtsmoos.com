// B"H
/**
 * @file CollisionAudit.js
 * @description
 * Chapter 626: The hidden walls must name themselves.
 *
 * Every octree insertion can now leave a small breadcrumb in the phone console:
 * what mesh entered, why it entered, where its world bounds are, and whether it
 * was accepted or skipped. The Awtsmoos reveals the unseen collider by forcing
 * it to confess its box.
 */
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";
const MAX_LOGS = 12;
const state = { accepted: 0, skipped: 0 };
const enabled = () => globalThis.__AWTSMOOS_COLLISION_AUDIT__ === true;
const n = value => Number.isFinite(Number(value)) ? Number(Number(value).toFixed(3)) : null;
function worldBox(mesh) {
  if (!mesh?.geometry) return null;
  mesh.updateMatrixWorld?.(true);
  if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox?.();
  const box = mesh.geometry.boundingBox?.clone?.().applyMatrix4(mesh.matrixWorld) || new THREE.Box3().setFromObject(mesh);
  if (!Number.isFinite(box.min.x) || !Number.isFinite(box.max.x)) return null;
  return { min: { x: n(box.min.x), y: n(box.min.y), z: n(box.min.z) }, max: { x: n(box.max.x), y: n(box.max.y), z: n(box.max.z) } };
}
function point(mesh) {
  const p = new THREE.Vector3();
  mesh?.getWorldPosition?.(p);
  return { x: n(p.x), y: n(p.y), z: n(p.z) };
}
function kind(mesh) {
  const data = mesh?.userData || {};
  const owner = mesh?.nivraAwtsmoos || data.nivraAwtsmoos || data.owner || data.nivra;
  return data.awtsmoosType || data.type || owner?.type || owner?.constructor?.name || mesh?.type;
}
function record(label, mesh, reason, counter) {
  state[counter] += 1;
  if (!enabled() || state[counter] > MAX_LOGS) return;
  console.debug(label, { name: mesh?.name, type: kind(mesh), reason, role: mesh?.userData?.colliderRole, position: point(mesh), box: worldBox(mesh) });
}
export function auditAccepted(mesh, reason = 'accepted') { record('B"H | COLLIDER_ACCEPTED_AUDIT', mesh, reason, 'accepted'); }
export function auditSkipped(mesh, reason = 'skipped') { record('B"H | COLLIDER_SKIPPED_AUDIT', mesh, reason, 'skipped'); }
export function auditSummary(extra = {}) { if (enabled()) console.debug('B"H | COLLIDER_AUDIT_SUMMARY', { ...state, ...extra }); }
