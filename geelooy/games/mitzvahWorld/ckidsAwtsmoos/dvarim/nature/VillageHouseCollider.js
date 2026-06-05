// B"H
/**
 * @file VillageHouseCollider.js
 * @description
 * Chapter 154: The brick wall becomes judgment instead of decoration.
 *
 * The house root must stay skipped so the whole visual village does not flood
 * physics. Yet each hidden wall is true matter. The Awtsmoos now bakes detached
 * world-space clones of those wall boxes into the octree, so the parent veil no
 * longer cancels the children and the chossid cannot close through brick.
 */
import Domem from "../../chayim/domem/index.js";
import * as THREE from "/games/scripts/build/three.module.js";
import { bakeDetachedCollider, removeDetachedColliders } from "./OctreeBakeClone.js";

const num = (v, f = 0) => Number.isFinite(Number(v)) ? Number(v) : f;
const debugColor = 0x00ff00;

function invisibleMaterial() {
  return new THREE.MeshBasicMaterial({ color: debugColor, transparent: true, opacity: 0, depthWrite: false, depthTest: false });
}
function finiteVec3(v) { return [v.x, v.y, v.z].every(Number.isFinite); }
function mark(mesh, owner) {
  mesh.visible = true;
  mesh.nivraAwtsmoos = owner;
  Object.assign(mesh.userData ||= {}, { isVillageHouseCollider: true, colliderRole: mesh.name, useAuthoredY: true, isSolid: true, explicitCollision: true, addToOctree: true, collisionBody: true });
  delete mesh.userData.skipRaycast;
}
function box(root, owner, name, pos, size) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(size[0], size[1], size[2]), invisibleMaterial());
  mesh.name = name;
  mesh.position.set(pos[0], pos[1], pos[2]);
  mark(mesh, owner);
  root.add(mesh);
  return mesh;
}

export default class VillageHouseCollider extends Domem {
  type = "villageHouseCollider";

  constructor(op = {}, olam) {
    super({ ...op, golem: null, isSolid: false, interactable: false }, olam);
    this.options = op;
    this.isSolid = false;
    this.useAuthoredY = true;
    this._octreeMeshes = [];
  }

  async heescheel(olam) {
    this.olam = olam;
    this.mesh = this.buildRoot();
    this.mesh.position.copy(this.position.vector3());
    this.mesh.rotation.y = num(this.rotation?.y, 0);
    Object.assign(this.mesh.userData ||= {}, { awaitingVillageFinalTransform: true, skipOctree: true, noOctree: true, useAuthoredY: true });
    delete this.mesh.userData.skipRaycast;
    await olam.hoyseef(this);
    this.mesh.updateMatrixWorld(true);
    this.isReady = true;
  }

  dims() {
    const width = num(this.options.colliderWidth ?? this.options.width, 11);
    const depth = num(this.options.colliderDepth ?? this.options.depth, 8);
    const height = num(this.options.colliderHeight ?? this.options.height, 5.2);
    const wall = num(this.options.wallThickness, 0.42);
    const floorTop = num(this.options.floorTop, 0.34);
    const doorWidth = num(this.options.doorWidth, 2.0);
    const doorHeight = num(this.options.doorHeight, 3.0);
    return { width, depth, height, wall, floorTop, doorWidth, doorHeight };
  }

  buildRoot() {
    const d = this.dims();
    const root = new THREE.Group();
    root.name = this.name || "VillageHouseCollider_simple_final_octree_boxes";
    Object.assign(root.userData ||= {}, { isVillageHouseCollider: true, awaitingVillageFinalTransform: true, skipOctree: true, noOctree: true, useAuthoredY: true });
    box(root, this, "house_floor_simple_octree", [0, d.floorTop - 0.06, 0], [d.width, 0.12, d.depth]);
    box(root, this, "house_porch_simple_octree", [0, d.floorTop - 0.05, d.depth / 2 + 1.0], [d.doorWidth + 1.6, 0.1, 2.0]);
    box(root, this, "house_back_wall_simple_octree", [0, d.height / 2, -d.depth / 2], [d.width, d.height, d.wall]);
    box(root, this, "house_left_wall_simple_octree", [-d.width / 2, d.height / 2, 0], [d.wall, d.height, d.depth]);
    box(root, this, "house_right_wall_simple_octree", [d.width / 2, d.height / 2, 0], [d.wall, d.height, d.depth]);
    const side = Math.max(0.2, (d.width - d.doorWidth) / 2);
    box(root, this, "house_front_left_wall_simple_octree", [-(d.doorWidth / 2 + side / 2), d.height / 2, d.depth / 2], [side, d.height, d.wall]);
    box(root, this, "house_front_right_wall_simple_octree", [(d.doorWidth / 2 + side / 2), d.height / 2, d.depth / 2], [side, d.height, d.wall]);
    const lintel = Math.max(0.2, d.height - d.doorHeight);
    box(root, this, "house_front_lintel_simple_octree", [0, d.doorHeight + lintel / 2, d.depth / 2], [d.doorWidth, lintel, d.wall]);
    return root;
  }

  alignToFinalHouseTransform(houseMesh) {
    if (!this.mesh || !houseMesh?.isObject3D) return false;
    houseMesh.updateMatrixWorld(true);
    houseMesh.getWorldPosition(this.mesh.position);
    houseMesh.getWorldQuaternion(this.mesh.quaternion);
    this.mesh.scale.copy(houseMesh.getWorldScale(new THREE.Vector3()));
    this.mesh.updateMatrixWorld(true);
    Object.assign(this.mesh.userData, { awaitingVillageFinalTransform: false, coupledToFinalVisualHouse: true, copiedVisualScale: this.mesh.scale.toArray() });
    return this.hasFiniteWorldTransform();
  }

  hasFiniteWorldTransform() {
    let ok = true;
    this.mesh?.updateMatrixWorld(true);
    this.mesh?.traverse?.(child => {
      if (!child.isMesh) return;
      const p = new THREE.Vector3();
      child.getWorldPosition(p);
      if (!finiteVec3(p)) ok = false;
    });
    return ok;
  }

  addFinalCollidersToOctree(olam = this.olam) {
    if (!this.mesh || !olam?.worldOctree || this.mesh.userData.awaitingVillageFinalTransform) return 0;
    if (!this.hasFiniteWorldTransform()) {
      console.warn("B\"H | HOUSE_COLLIDER_NOT_ADDED_NAN_TRANSFORM", { name: this.name });
      return 0;
    }
    this.removeFinalCollidersFromOctree(olam);
    const added = [];
    this.mesh.updateMatrixWorld(true);
    this.mesh.traverse(child => { if (child.isMesh && child.userData?.isVillageHouseCollider) bakeDetachedCollider(child, olam, added); });
    this._octreeMeshes = added;
    console.info("B\"H | HOUSE_SIMPLE_COLLIDERS_ADDED_TO_OCTREE", { name: this.name, added: added.length, scale: this.mesh.scale.toArray() });
    return added.length;
  }

  removeFinalCollidersFromOctree(olam = this.olam) {
    removeDetachedColliders(olam, this._octreeMeshes);
    this._octreeMeshes = [];
  }

  floorTopWorldY() { return num(this.mesh?.position?.y, 0) + this.dims().floorTop * num(this.mesh?.scale?.y, 1); }
}
