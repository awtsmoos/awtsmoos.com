// B"H
/**
 * @file VillageHouseCollider.js
 * @description Chapter 638: the house becomes solid by measured simple walls.
 *
 * The visual house may be complex geometry, many small bricks and roof shapes,
 * but the octree receives only a calm measured wall shell. During final village
 * settle, the finished house is measured in its own local space, six simple
 * slabs are rebuilt around it, and detached exact box bodies enter physics.
 */
import Domem from "../../chayim/domem/index.js";
import * as THREE from "/games/scripts/build/three.module.js";
import { bakeDetachedCollider, removeDetachedColliders } from "./OctreeBakeClone.js";
import { rebuildMeasuredHouseShell } from "./houseCollider/VillageHouseAutoShell.js";
const num = (v, f = 0) => Number.isFinite(Number(v)) ? Number(v) : f;
const mat = () => new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0, depthWrite: false, depthTest: false });
function mark(mesh, owner) {
  mesh.visible = true;
  mesh.nivraAwtsmoos = owner;
  Object.assign(mesh.userData ||= {}, { isVillageHouseCollider: true, colliderRole: mesh.name, useAuthoredY: true, isSolid: true, explicitCollision: true, addToOctree: true, collisionBody: true, keepOriginalCollider: true, useExactGeometryCollider: true });
  delete mesh.userData.skipRaycast;
}
function box(root, owner, name, pos, size) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), mat());
  mesh.name = name;
  mesh.position.set(...pos);
  mark(mesh, owner);
  root.add(mesh);
}
function finiteWorld(root) {
  let ok = true;
  root?.updateMatrixWorld?.(true);
  root?.traverse?.(child => {
    if (!child.isMesh) return;
    const p = new THREE.Vector3();
    child.getWorldPosition(p);
    if (![p.x, p.y, p.z].every(Number.isFinite)) ok = false;
  });
  return ok;
}
export default class VillageHouseCollider extends Domem {
  type = "villageHouseCollider";
  constructor(op = {}, olam) {
    super({ ...op, golem: null, isSolid: false, interactable: false }, olam);
    this.options = op;
    this.useAuthoredY = true;
    this._octreeMeshes = [];
  }
  dims() {
    const width = num(this.options.colliderWidth ?? this.options.width, 11);
    const depth = num(this.options.colliderDepth ?? this.options.depth, 8);
    const height = num(this.options.colliderHeight ?? this.options.height, 5.8);
    const wall = num(this.options.wallThickness ?? this.options.thickness, 0.34);
    const doorWidth = num(this.options.doorWidth, 2.2);
    const doorHeight = num(this.options.doorClearHeight ?? this.options.doorHeight, 3.1);
    return { width, depth, height, wall, doorWidth, doorHeight };
  }
  buildRoot() {
    const d = this.dims(), root = new THREE.Group(), halfW = d.width / 2, halfD = d.depth / 2;
    root.name = this.name || "VillageHouseCollider_wall_only_octree";
    Object.assign(root.userData ||= {}, { isVillageHouseCollider: true, awaitingVillageFinalTransform: true, skipOctree: true, noOctree: true, useAuthoredY: true });
    box(root, this, "house_back_wall_octree", [0, d.height / 2, -halfD], [d.width, d.height, d.wall]);
    box(root, this, "house_left_wall_octree", [-halfW, d.height / 2, 0], [d.wall, d.height, d.depth]);
    box(root, this, "house_right_wall_octree", [halfW, d.height / 2, 0], [d.wall, d.height, d.depth]);
    const side = Math.max(0.2, (d.width - d.doorWidth) / 2);
    box(root, this, "house_front_left_wall_octree", [-(d.doorWidth / 2 + side / 2), d.height / 2, halfD], [side, d.height, d.wall]);
    box(root, this, "house_front_right_wall_octree", [(d.doorWidth / 2 + side / 2), d.height / 2, halfD], [side, d.height, d.wall]);
    const lintel = Math.max(0.2, d.height - d.doorHeight);
    box(root, this, "house_front_lintel_octree", [0, d.doorHeight + lintel / 2, halfD], [d.doorWidth, lintel, d.wall]);
    return root;
  }
  async heescheel(olam) {
    this.olam = olam;
    this.mesh = this.buildRoot();
    this.mesh.position.copy(this.position.vector3());
    this.mesh.rotation.y = num(this.rotation?.y, 0);
    await olam.hoyseef(this);
    this.mesh.updateMatrixWorld(true);
    this.isReady = true;
  }
  alignToFinalHouseTransform(houseMesh) {
    if (!this.mesh || !houseMesh?.isObject3D) return false;
    const measured = rebuildMeasuredHouseShell({ root: this.mesh, owner: this, houseMesh, options: this.options, materialFactory: mat });
    if (!measured) {
      houseMesh.updateMatrixWorld(true);
      houseMesh.getWorldPosition(this.mesh.position);
      houseMesh.getWorldQuaternion(this.mesh.quaternion);
      this.mesh.scale.set(1, 1, 1);
      this.mesh.userData.awaitingVillageFinalTransform = false;
      this.mesh.updateMatrixWorld(true);
    }
    return finiteWorld(this.mesh);
  }
  addFinalCollidersToOctree(olam = this.olam) {
    if (!this.mesh || !olam?.worldOctree || this.mesh.userData.awaitingVillageFinalTransform || !finiteWorld(this.mesh)) return 0;
    this.removeFinalCollidersFromOctree(olam);
    const added = [];
    this.mesh.traverse(child => { if (child.isMesh && child.userData?.isVillageHouseCollider) bakeDetachedCollider(child, olam, added); });
    this._octreeMeshes = added;
    console.info("B\"H | HOUSE_WALL_ONLY_COLLIDERS_ADDED_TO_OCTREE", { name: this.name, added: added.length });
    return added.length;
  }
  removeFinalCollidersFromOctree(olam = this.olam) { removeDetachedColliders(olam, this._octreeMeshes); this._octreeMeshes = []; }
  floorTopWorldY() { return num(this.mesh?.position?.y, 0); }
}
