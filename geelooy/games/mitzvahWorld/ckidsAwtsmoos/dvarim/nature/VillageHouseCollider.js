// B"H
/**
 * @file VillageHouseCollider.js
 * @description
 * Chapter 123: The house collider enters the octree only after the house exists.
 *
 * The Awtsmoos does not let invisible walls wander before the brick vessel has
 * settled. This Nivra is non-solid at birth, hidden from octree/raycast, then
 * the village grounding pass copies the final visual house position, rotation,
 * and scale. Only after that alignment are the child collider meshes added to
 * the octree. Door opening remains clear, walls remain scaled to the house.
 */
import Domem from "../../chayim/domem/index.js";
import * as THREE from "/games/scripts/build/three.module.js";
import { colliderMetrics } from "./villagePicture/cottage/cottageContract.js?v=wide-door-low-floor-20260603-bh347";

const num = (v, f = 0) => Number.isFinite(Number(v)) ? Number(v) : f;
const hidden = new THREE.MeshBasicMaterial({ visible: false, transparent: true, opacity: 0, depthWrite: false });

function inert(mesh, owner, role) {
  mesh.visible = false;
  if (mesh.material) mesh.material.visible = false;
  Object.assign(mesh.userData ||= {}, {
    isSolid: false,
    explicitCollision: false,
    isVillageHouseCollider: true,
    villageHouseFinalOnly: true,
    skipOctree: true,
    noOctree: true,
    skipRaycast: true,
    useAuthoredY: true,
    colliderRole: role
  });
  mesh.nivraAwtsmoos = owner;
}
function activate(mesh) {
  Object.assign(mesh.userData ||= {}, {
    isSolid: true,
    explicitCollision: true,
    skipOctree: false,
    noOctree: false,
    skipRaycast: true,
    finalOctreeOnly: true
  });
}
function addCollider(root, owner, name, p, s, role = "house") {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...s), hidden.clone());
  mesh.name = name;
  mesh.position.set(...p);
  inert(mesh, owner, role);
  root.add(mesh);
  return mesh;
}
function furniture(root, owner, c) {
  addCollider(root, owner, "solid_table_contract_scaled", [1.7, c.floorTop + 0.8, -2.64], [2.0, 0.55, 1.34], "furniture");
  addCollider(root, owner, "solid_bookshelf_contract_scaled", [-12.24, c.floorTop + 1.95, 0.96], [0.96, 3.1, 1.92], "furniture");
  addCollider(root, owner, "solid_bed_contract_scaled", [10.32, c.floorTop + 0.64, 3.36], [2.3, 0.62, 1.64], "furniture");
}
function floors(root, owner, c) {
  addCollider(root, owner, "walkable_interior_floor_low_contract", [0, c.floorTop - 0.045, -0.18], [c.width + 0.7, 0.09, c.depth + 0.36], "floor");
  addCollider(root, owner, "walkable_front_porch_low_contract", [0, c.floorTop - 0.045, c.depth / 2 + 2.05], [c.doorWidth + 3.8, 0.09, 4.18], "porch");
  addCollider(root, owner, "doorway_flat_threshold_low_contract", [0, c.floorTop - 0.035, c.depth / 2 + 0.42], [c.doorWidth + 1.3, 0.07, 1.62], "threshold");
}
function walls(root, owner, c) {
  addCollider(root, owner, "house_back_wall_contract", [0, c.height / 2, -c.depth / 2], [c.width, c.height, c.thickness], "wall");
  addCollider(root, owner, "house_left_wall_contract", [-c.width / 2, c.height / 2, 0], [c.thickness, c.height, c.depth], "wall");
  addCollider(root, owner, "house_right_wall_contract", [c.width / 2, c.height / 2, 0], [c.thickness, c.height, c.depth], "wall");
  const side = Math.max(0.1, (c.width - c.doorWidth) / 2);
  addCollider(root, owner, "house_front_left_contract_wide_opening", [-(c.doorWidth / 2 + side / 2), c.height / 2, c.depth / 2], [side, c.height, c.thickness], "wall");
  addCollider(root, owner, "house_front_right_contract_wide_opening", [(c.doorWidth / 2 + side / 2), c.height / 2, c.depth / 2], [side, c.height, c.thickness], "wall");
  const lintelHeight = Math.max(0.1, c.height - c.doorClearHeight);
  if (lintelHeight > 0.12) addCollider(root, owner, "house_lintel_contract_high_above_opening", [0, c.doorClearHeight + lintelHeight / 2, c.depth / 2], [c.doorWidth, lintelHeight, c.thickness], "lintel");
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
    this.mesh.position.y = num(this.options.groundY ?? this.mesh.position.y, this.mesh.position.y);
    this.mesh.rotation.y = num(this.rotation?.y, 0);
    Object.assign(this.mesh.userData ||= {}, { awaitingVillageFinalTransform: true, skipOctree: true, noOctree: true, skipRaycast: true, useAuthoredY: true });
    await olam.hoyseef(this);
    this.mesh.updateMatrixWorld(true);
    this.isReady = true;
  }

  buildRoot() {
    const c = colliderMetrics();
    const root = new THREE.Group();
    root.name = this.name || "VillageHouseCollider_final_only_scaled_to_visual_house";
    Object.assign(root.userData ||= {}, {
      isVillageHouseCollider: true,
      useAuthoredY: true,
      skipOctree: true,
      noOctree: true,
      skipRaycast: true,
      contractDoorWidth: c.doorWidth,
      contractDoorClearHeight: c.doorClearHeight
    });
    floors(root, this, c);
    walls(root, this, c);
    furniture(root, this, c);
    return root;
  }

  alignToFinalHouseTransform(houseMesh) {
    if (!this.mesh || !houseMesh?.isObject3D) return false;
    houseMesh.updateMatrixWorld(true);
    houseMesh.getWorldPosition(this.mesh.position);
    houseMesh.getWorldQuaternion(this.mesh.quaternion);
    this.mesh.scale.copy(houseMesh.getWorldScale(new THREE.Vector3()));
    this.mesh.updateMatrixWorld(true);
    Object.assign(this.mesh.userData, {
      awaitingVillageFinalTransform: false,
      coupledToFinalVisualHouse: true,
      copiedVisualScale: this.mesh.scale.toArray()
    });
    return this.isFiniteWorldTransform();
  }

  isFiniteWorldTransform() {
    let ok = true;
    this.mesh?.updateMatrixWorld(true);
    this.mesh?.traverse?.(child => {
      if (!child.isMesh) return;
      const e = child.matrixWorld.elements;
      for (let i = 0; i < e.length; i += 1) if (!Number.isFinite(e[i])) ok = false;
    });
    return ok;
  }

  addFinalCollidersToOctree(olam = this.olam) {
    if (!this.mesh || !olam?.worldOctree || this.mesh.userData.awaitingVillageFinalTransform) return 0;
    if (!this.isFiniteWorldTransform()) {
      console.warn("B\"H | HOUSE_COLLIDER_NOT_ADDED_NAN_TRANSFORM", { name: this.name });
      return 0;
    }
    this.removeFinalCollidersFromOctree(olam);
    const added = [];
    this.mesh.traverse(child => {
      if (!child.isMesh || !child.userData?.isVillageHouseCollider) return;
      activate(child);
      child.updateMatrixWorld(true);
      if (olam.worldOctree.addObject(child)) added.push(child);
    });
    this._octreeMeshes = added;
    return added.length;
  }

  removeFinalCollidersFromOctree(olam = this.olam) {
    if (!olam?.worldOctree || !this._octreeMeshes?.length) return;
    for (const mesh of this._octreeMeshes) olam.worldOctree.removeMesh?.(mesh);
    this._octreeMeshes = [];
  }

  floorTopWorldY() {
    return num(this.mesh?.position?.y, 0) + colliderMetrics().floorTop * num(this.mesh?.scale?.y, 1);
  }
}
