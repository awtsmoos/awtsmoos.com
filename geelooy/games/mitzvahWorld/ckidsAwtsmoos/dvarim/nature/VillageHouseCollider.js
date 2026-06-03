// B"H
/**
 * @file VillageHouseCollider.js
 * @description
 * Chapter 231: The invisible furniture shrinks to human truth.
 *
 * The Awtsmoos reveals the rule: the house can be big, but the table may not be
 * a mountain. Decorative cottage meshes stay out of octree; these simple boxes
 * alone provide floor, walls, jambs, lintel, and modest furniture touch after
 * final visual grounding.
 */
import Domem from "../../chayim/domem/index.js";
import * as THREE from "/games/scripts/build/three.module.js";

const num = (v, f = 0) => Number.isFinite(Number(v)) ? Number(v) : f;
const hidden = new THREE.MeshBasicMaterial({ visible: false, transparent: true, opacity: 0 });
const VISIBLE_HOUSE_SCALE = 4.8;
const sc = values => values.map(v => v * VISIBLE_HOUSE_SCALE);
const pos = (x, y, z) => sc([x, y, z]);
const size = (x, y, z) => sc([x, y, z]);

function mark(mesh, owner) {
  Object.assign(mesh.userData ||= {}, { isSolid: true, explicitCollision: true, isVillageHouseCollider: true, villageHouseFinalOnly: true, useAuthoredY: true });
  mesh.nivraAwtsmoos = owner;
}
function addCollider(root, owner, name, p, s) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...s), hidden.clone());
  mesh.name = name; mesh.position.set(...p); mark(mesh, owner); root.add(mesh); return mesh;
}
function addFurniture(root, owner) {
  addCollider(root, owner, "solid_table_human_scaled", pos(0.35, 0.23, -0.55), size(0.5, 0.24, 0.36));
  addCollider(root, owner, "solid_stool_human_scaled", pos(-0.55, 0.11, -0.46), size(0.18, 0.18, 0.18));
  addCollider(root, owner, "solid_bookshelf_human_scaled", pos(-2.55, 0.45, 0.2), size(0.24, 0.72, 0.48));
  addCollider(root, owner, "solid_cabinet_plant_base_human_scaled", pos(-1.25, 0.28, -1.35), size(0.42, 0.42, 0.28));
  addCollider(root, owner, "solid_bed_human_scaled", pos(2.15, 0.18, 0.7), size(0.56, 0.22, 0.42));
  addCollider(root, owner, "solid_chest_human_scaled", pos(1.25, 0.18, 1.1), size(0.36, 0.24, 0.24));
}
function colliderSpecs(options) {
  const w = num(options.width, 34), d = num(options.depth, 23), h = num(options.height, 13.6);
  const t = num(options.thickness, 0.85), doorW = num(options.doorWidth, 2.12);
  const floorTop = num(options.floorTop, 0.2), doorClearH = num(options.doorClearHeight, 3.95);
  return { w, d, h, t, doorW, floorTop, doorClearH };
}

export default class VillageHouseCollider extends Domem {
  type = "villageHouseCollider";
  constructor(op = {}, olam) { super({ ...op, golem: null, isSolid: true, interactable: false }, olam); this.options = op; this.useAuthoredY = true; this._octreeMeshes = []; }
  async heescheel(olam) {
    this.olam = olam; this.mesh = this.buildRoot(); this.mesh.position.copy(this.position.vector3());
    this.mesh.position.y = num(this.options.groundY ?? this.mesh.position.y, this.mesh.position.y);
    this.mesh.rotation.y = num(this.rotation?.y, 0); this.mesh.userData.awaitingVillageFinalTransform = true;
    await olam.hoyseef(this); this.mesh.updateMatrixWorld(true); this.isReady = true;
  }
  buildRoot() {
    const { w, d, h, t, doorW, floorTop, doorClearH } = colliderSpecs(this.options);
    const root = new THREE.Group(); root.name = this.name || "VillageHouseCollider";
    Object.assign(root.userData ||= {}, { isVillageHouseCollider: true, useAuthoredY: true });
    addCollider(root, this, "house_floor_flush_final", [0, floorTop - 0.06, 0], [w, 0.12, d]);
    addCollider(root, this, "house_back_wall", [0, h / 2, -d / 2], [w, h, t]);
    addCollider(root, this, "house_left_wall", [-w / 2, h / 2, 0], [t, h, d]);
    addCollider(root, this, "house_right_wall", [w / 2, h / 2, 0], [t, h, d]);
    addCollider(root, this, "house_front_left_jamb", [-(doorW / 2 + (w - doorW) / 4), h / 2, d / 2], [(w - doorW) / 2, h, t]);
    addCollider(root, this, "house_front_right_jamb", [(doorW / 2 + (w - doorW) / 4), h / 2, d / 2], [(w - doorW) / 2, h, t]);
    addCollider(root, this, "house_high_lintel_only", [0, (doorClearH + h) / 2, d / 2], [doorW, h - doorClearH, t]);
    addFurniture(root, this); return root;
  }
  alignToFinalHouseTransform(houseMesh) {
    if (!this.mesh || !houseMesh?.isObject3D) return false;
    houseMesh.updateMatrixWorld(true); houseMesh.getWorldPosition(this.mesh.position); houseMesh.getWorldQuaternion(this.mesh.quaternion);
    this.mesh.scale.set(1, 1, 1); this.mesh.updateMatrixWorld(true);
    Object.assign(this.mesh.userData, { awaitingVillageFinalTransform: false, coupledToFinalVisualHouse: true }); return true;
  }
  addFinalCollidersToOctree(olam = this.olam) {
    if (!this.mesh || !olam?.worldOctree) return 0; this.removeFinalCollidersFromOctree(olam); this.mesh.updateMatrixWorld(true);
    const added = []; this.mesh.traverse(child => { if (child.isMesh && child.userData?.isVillageHouseCollider && olam.worldOctree.addObject(child)) added.push(child); });
    this._octreeMeshes = added; return added.length;
  }
  removeFinalCollidersFromOctree(olam = this.olam) { if (!olam?.worldOctree || !this._octreeMeshes?.length) return; for (const mesh of this._octreeMeshes) olam.worldOctree.removeMesh?.(mesh); this._octreeMeshes = []; }
  floorTopWorldY() { return num(this.mesh?.position?.y, 0) + num(this.options.floorTop, 0.2); }
}
