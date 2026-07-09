// B"H
/**
 * @file VillageRoadCollider.js
 * @description
 * Chapter 153: The road is soft underfoot but honest at its edges.
 *
 * The beautiful dirt path remains decorative, while detached slab clones enter
 * the octree without inheriting any skipped parent. Thus the ground can guide
 * motion cleanly while the Awtsmoos keeps collision simple, finite, and clear.
 */
import Domem from "../../chayim/domem/index.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";
import { bakeDetachedCollider, removeDetachedColliders } from "./OctreeBakeClone.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

const num = (v, f = 0) => Number.isFinite(Number(v)) ? Number(v) : f;
const hidden = new THREE.MeshBasicMaterial({ visible: false, transparent: true, opacity: 0, depthWrite: false });

function box(owner, name, size, pos, role) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), hidden.clone());
  mesh.name = name;
  mesh.visible = false;
  mesh.position.set(...pos);
  mesh.nivraAwtsmoos = owner;
  Object.assign(mesh.userData ||= {}, { isSolid: true, explicitCollision: true, collisionBody: true, addToOctree: true, isVillageRoadCollider: true, useAuthoredY: true, colliderRole: role });
  delete mesh.userData.skipRaycast;
  return mesh;
}

export default class VillageRoadCollider extends Domem {
  type = "villageRoadCollider";

  constructor(op = {}, olam) {
    super({ ...op, golem: null, isSolid: true, interactable: false }, olam);
    this.options = op;
    this.targetName = op.targetName || "";
    this.useAuthoredY = true;
    this._octreeMeshes = [];
  }

  async heescheel(olam) {
    this.olam = olam;
    this.mesh = this.buildRoot();
    this.mesh.name = this.name || "VillageRoadCollider_simple_grounded_slabs";
    this.mesh.position.copy(this.position.vector3());
    this.mesh.rotation.y = num(this.rotation?.y, 0);
    Object.assign(this.mesh.userData ||= {}, { awaitingVillageFinalTransform: true, skipOctree: true, noOctree: true, useAuthoredY: true });
    await olam.hoyseef(this);
    this.isReady = true;
  }

  buildRoot() {
    const root = new THREE.Group();
    const length = num(this.options.length, 35), width = num(this.options.width, 4.6), height = num(this.options.height, 0.16);
    root.add(box(this, "walkable_road_center_slab", [width, height, length], [0, height / 2, 0], "road-floor"));
    if (this.options.edgeColliders !== false) {
      root.add(box(this, "road_left_soft_edge", [0.34, height * 2, length], [-width / 2 - 0.22, height, 0], "road-edge"));
      root.add(box(this, "road_right_soft_edge", [0.34, height * 2, length], [width / 2 + 0.22, height, 0], "road-edge"));
    }
    Object.assign(root.userData ||= {}, { isVillageRoadCollider: true, useAuthoredY: true });
    return root;
  }

  alignToFinalRoadTransform(roadMesh) {
    if (!this.mesh || !roadMesh?.isObject3D) return false;
    roadMesh.updateMatrixWorld(true);
    roadMesh.getWorldPosition(this.mesh.position);
    roadMesh.getWorldQuaternion(this.mesh.quaternion);
    this.mesh.scale.set(1, 1, 1);
    this.mesh.position.y += num(this.options.groundLift, 0.035);
    this.mesh.updateMatrixWorld(true);
    this.mesh.userData.awaitingVillageFinalTransform = false;
    return true;
  }

  addFinalCollidersToOctree(olam = this.olam) {
    if (!olam?.worldOctree || !this.mesh || this.mesh.userData.awaitingVillageFinalTransform) return 0;
    this.removeFinalCollidersFromOctree(olam);
    const added = [];
    this.mesh.updateMatrixWorld(true);
    this.mesh.traverse(child => { if (child.isMesh && child.userData?.isVillageRoadCollider) bakeDetachedCollider(child, olam, added); });
    this._octreeMeshes = added;
    return added.length;
  }

  removeFinalCollidersFromOctree(olam = this.olam) {
    removeDetachedColliders(olam, this._octreeMeshes);
    this._octreeMeshes = [];
  }
}
