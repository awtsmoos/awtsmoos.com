// B"H
/**
 * @file VillageHouseCollider.js
 * @description
 * Chapter 203: The invisible floor returns to the visible brick.
 *
 * The Awtsmoos revealed the hidden arithmetic after the full read: the cottage
 * picture is scaled by 4.8, so the visible floor top is near 0.34 world units.
 * A floor collider at 0.08 would make the chossid sink; the old 0.4 made him
 * hover. This vessel now sets the floor to 0.34, and gives the doorway a real
 * low threshold stone whose top agrees with the visible step without sealing the
 * passage that a player must cross.
 */
import Domem from "../../chayim/domem/index.js";
import * as THREE from "/games/scripts/build/three.module.js";

const num = (v, f = 0) => Number.isFinite(Number(v)) ? Number(v) : f;
const invisible = new THREE.MeshBasicMaterial({ visible: false, transparent: true, opacity: 0 });
const S = 4.8;
const sc = values => values.map(v => v * S);
const pos = (x, y, z) => sc([x, y, z]);
const size = (x, y, z) => sc([x, y, z]);

function addCollider(root, owner, name, p, s) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...s), invisible.clone());
  mesh.name = name;
  mesh.position.set(...p);
  Object.assign(mesh.userData ||= {}, { isSolid: true, isVillageHouseCollider: true, useAuthoredY: true });
  mesh.nivraAwtsmoos = owner;
  root.add(mesh);
  return mesh;
}

function addFurniture(root, owner) {
  addCollider(root, owner, "solid_table_small_scaled", pos(0.35, 0.34, -0.55), size(0.76, 0.42, 0.52));
  addCollider(root, owner, "solid_stool_scaled", pos(-0.55, 0.16, -0.46), size(0.3, 0.32, 0.3));
  addCollider(root, owner, "solid_bookshelf_scaled", pos(-2.55, 0.66, 0.2), size(0.36, 1.08, 0.66));
  addCollider(root, owner, "solid_cabinet_plant_base_scaled", pos(-1.25, 0.42, -1.35), size(0.58, 0.6, 0.36));
  addCollider(root, owner, "solid_bed_right_scaled", pos(2.15, 0.24, 0.7), size(0.78, 0.42, 0.56));
  addCollider(root, owner, "solid_chest_right_scaled", pos(1.25, 0.25, 1.1), size(0.5, 0.36, 0.32));
}

function addThreshold(root, owner, floorTop, d) {
  addCollider(root, owner, "house_door_threshold_touchable", [0, 0.43, d / 2 + 0.55], [5.0, 0.18, 2.6]);
  addCollider(root, owner, "house_inside_threshold_lip", [0, 0.4, d / 2 - 0.42], [4.8, 0.12, 0.52]);
  addCollider(root, owner, "house_left_door_cheek_low", [-2.16, floorTop + 0.36, d / 2 + 0.14], [0.48, 0.72, 1.0]);
  addCollider(root, owner, "house_right_door_cheek_low", [2.16, floorTop + 0.36, d / 2 + 0.14], [0.48, 0.72, 1.0]);
}

export default class VillageHouseCollider extends Domem {
  type = "villageHouseCollider";

  constructor(op = {}, olam) {
    super({ ...op, golem: null, isSolid: true, interactable: false }, olam);
    this.options = op;
    this.useAuthoredY = true;
  }

  async heescheel(olam) {
    this.olam = olam;
    const w = num(this.options.width, 34);
    const d = num(this.options.depth, 23);
    const h = num(this.options.height, 13.6);
    const t = num(this.options.thickness, 0.85);
    const doorW = num(this.options.doorWidth, 1.82);
    const floorTop = num(this.options.floorTop, 0.34);
    const doorClearH = num(this.options.doorClearHeight, 3.72);
    this.mesh = new THREE.Group();
    this.mesh.name = this.name || "VillageHouseCollider";
    Object.assign(this.mesh.userData ||= {}, { isVillageHouseCollider: true, useAuthoredY: true });
    addCollider(this.mesh, this, "house_floor_scaled_flush", [0, floorTop - 0.08, 0], [w, 0.16, d]);
    addThreshold(this.mesh, this, floorTop, d);
    addCollider(this.mesh, this, "house_back_wall", [0, h / 2, -d / 2], [w, h, t]);
    addCollider(this.mesh, this, "house_left_wall", [-w / 2, h / 2, 0], [t, h, d]);
    addCollider(this.mesh, this, "house_right_wall", [w / 2, h / 2, 0], [t, h, d]);
    addCollider(this.mesh, this, "house_front_left_jamb", [-(doorW / 2 + (w - doorW) / 4), h / 2, d / 2], [(w - doorW) / 2, h, t]);
    addCollider(this.mesh, this, "house_front_right_jamb", [(doorW / 2 + (w - doorW) / 4), h / 2, d / 2], [(w - doorW) / 2, h, t]);
    addCollider(this.mesh, this, "house_high_lintel_only", [0, (doorClearH + h) / 2, d / 2], [doorW, h - doorClearH, t]);
    addFurniture(this.mesh, this);
    this.mesh.position.copy(this.position.vector3());
    this.mesh.rotation.y = num(this.rotation?.y, 0);
    await olam.hoyseef(this);
    this.mesh.updateMatrixWorld(true);
    this.mesh.traverse(child => { if (child.isMesh) olam.worldOctree?.addObject(child); });
    this.isReady = true;
  }
}
