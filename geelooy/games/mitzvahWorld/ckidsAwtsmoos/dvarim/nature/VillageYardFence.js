// B"H
/** @file VillageYardFence.js @description A parcel fence root whose colliders are exactly split around gates. */
import Domem from "../../chayim/domem/index.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";
import { fenceColliderBodies } from "./YardFenceColliderBuilder.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
const wood = () => new THREE.MeshStandardMaterial({ color: 0x6b431f, roughness: 0.9 });
function rail(segment) {
  const a = segment.start, b = segment.end, l = Math.hypot(b.x - a.x, b.z - a.z);
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.18, l), wood());
  mesh.position.set((a.x + b.x) / 2, (segment.height || 1.25) * 0.55, (a.z + b.z) / 2);
  mesh.rotation.y = Math.atan2(b.x - a.x, b.z - a.z);
  mesh.name = `${segment.id}_visual_rail`; return mesh;
}
export default class VillageYardFence extends Domem {
  type = "villageYardFence";
  constructor(op = {}, olam) { super({ ...op, golem: null, isSolid: false, interactable: false }, olam); this.segments = op.segments || []; this.colliders = []; }
  async heescheel(olam) { this.olam = olam; this.mesh = new THREE.Group(); this.mesh.name = this.name || "parcel_yard_fence"; for (const s of this.segments) { this.mesh.add(rail(s)); this.colliders.push(...fenceColliderBodies(s)); } this.mesh.traverse(o => Object.assign(o.userData ||= {}, { visualOnlyFence: true, skipOctree: true, noOctree: true, isSolid: false })); await olam.hoyseef(this); for (const c of this.colliders) olam.worldOctree?.addObject?.(c); this.isReady = true; }
}
