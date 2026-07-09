// B"H
/** @file VillageYardGate.js @description Lockable yard gate with honest closed/open collider state. */
import Domem from "../../chayim/domem/index.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";
import { toggleLockable, registerLock } from "../../systems/locks/LockStateRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { emitLockUi } from "../../systems/locks/LockUiRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { buildGateCollider, setGateColliderOpen } from "./GateColliderRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
const num = (v, f = 0) => Number.isFinite(Number(v)) ? Number(v) : f;
function wood() { return new THREE.MeshStandardMaterial({ color: 0x7a4a23, roughness: 0.85 }); }
export default class VillageYardGate extends Domem {
  type = "villageYardGate"; heesHawveh = true;
  constructor(op = {}, olam) { super({ ...op, golem: null, isSolid: false, interactable: true }, olam); this.options = op; this.angle = 0; this.target = 0; this.openAngle = num(op.openAngle, -1.35); this.lock = null; }
  async heescheel(olam) { this.olam = olam; this.mesh = this.buildMesh(); this.mesh.position.copy(this.position.vector3()); this.mesh.rotation.y = num(this.rotation?.y, 0); await olam.hoyseef(this); this.lock = registerLock(olam, { lockId: this.options.lockId || `${this.name}_lock`, keyId: this.options.keyId, locked: this.options.locked !== false, ownerNpcId: this.options.ownerNpcId }); this.collider = buildGateCollider({ id: this.name || this.options.id, lockId: this.lock.lockId, x: this.mesh.position.x, z: this.mesh.position.z, yaw: this.mesh.rotation.y, width: num(this.options.width, 2.4), height: num(this.options.height, 1.25), thickness: num(this.options.thickness, 0.22) }); olam.worldOctree?.addObject?.(this.collider); this.isReady = true; }
  buildMesh() { const root = new THREE.Group(); root.name = this.name || "lockable_yard_gate"; this.hinge = new THREE.Group(); const leaf = new THREE.Mesh(new THREE.BoxGeometry(num(this.options.width, 2.4), num(this.options.height, 1.25), 0.18), wood()); leaf.position.x = num(this.options.width, 2.4) * 0.5; leaf.name = "visible_yard_gate_leaf"; this.hinge.add(leaf); root.add(this.hinge); root.traverse(o => Object.assign(o.userData ||= {}, { skipOctree: true, noOctree: true, lockableGateVisual: true })); return root; }
  ayshPeula(peula) { if (peula === "mouseEnter") return emitLockUi(this.olam, this.lock); if (peula !== "accepted interaction" && peula !== "pointerdown") return super.ayshPeula?.(peula); const result = toggleLockable(this.olam, this.lock); if (result.ok) { this.lock = result.lock; this.target = result.open ? this.openAngle : 0; setGateColliderOpen(this.olam, this.collider, result.open); } emitLockUi(this.olam, this.lock); return result; }
  heesHawvoos(dt) { this.angle += (this.target - this.angle) * Math.min(1, dt * 10); if (this.hinge) this.hinge.rotation.y = this.angle; }
}
