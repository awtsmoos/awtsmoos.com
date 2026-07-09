// B"H
/** @file GateColliderRuntime.js @description Closed gate collider enters octree; open gate removes it. */
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";
import { markCollider, COLLISION_POLICY } from "../../systems/collision/CollisionTruthContract.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
const mat = () => new THREE.MeshBasicMaterial({ visible: false, transparent: true, opacity: 0 });
export function buildGateCollider(gate = {}) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(gate.width || 2.4, gate.height || 1.25, gate.thickness || 0.22), mat());
  mesh.name = `${gate.id || "yard_gate"}_closed_collider`;
  mesh.position.set(gate.x || 0, (gate.height || 1.25) / 2, gate.z || 0);
  mesh.rotation.y = gate.yaw || 0;
  return markCollider(mesh, COLLISION_POLICY.authoredCollider, { gateId: gate.id, lockId: gate.lockId, closedGateCollider: true });
}
export function setGateColliderOpen(olam, mesh, open) {
  if (!mesh) return false;
  mesh.userData.isSolid = !open; mesh.userData.addToOctree = !open; mesh.userData.skipOctree = open;
  if (open) olam?.worldOctree?.removeMesh?.(mesh); else olam?.worldOctree?.addObject?.(mesh);
  return true;
}
export default { buildGateCollider, setGateColliderOpen };
