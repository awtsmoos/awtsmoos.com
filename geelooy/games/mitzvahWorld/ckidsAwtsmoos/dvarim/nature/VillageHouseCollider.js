// B"H
/**
 * @file VillageHouseCollider.js
 * @description
 * Chapter 205: The octree floor is lowered to the visible floor.
 *
 * The Awtsmoos revealed the floor wound in screenshots: the threshold helpers
 * were acting like invisible shelves. This complete rewrite removes raised lips
 * and doorway blocks. Only one low interior floor, four walls, two front jambs,
 * a high lintel, and simple furniture colliders enter the octree. Door and
 * visual masonry remain non-solid decoration.
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
  Object.assign(mesh.userData ||= {}, { isSolid: true, explicitCollision: true, isVillageHouseCollider: true, useAuthoredY: true });
  mesh.nivraAwtsmoos = owner;
  root.add(mesh);
  return mesh;
}

function addFurniture(root, owner) {
  addCollider(root, owner, "solid_table_small_scaled", pos(0.35, 0.31, -0.55), size(0.76, 0.34, 0.52));
  addCollider(root, owner, "solid_stool_scaled", pos(-0.55, 0.14, -0.46), size(0.3, 0.24, 0.3));
  addCollider(root, owner, "solid_bookshelf_scaled", pos(-2.55, 0.62, 0.2), size(0.36, 0.98, 0.66));
  addCollider(root, owner, "solid_cabinet_plant_base_scaled", pos(-1.25, 0.36, -1.35), size(0.58, 0.46, 0.36));
  addCollider(root, owner, "solid_bed_right_scaled", pos(2.15, 0.22, 0.7), size(0.78, 0.32, 0.56));
  addCollider(root, owner, "solid_chest_right_scaled", pos(1.25, 0.22, 1.1), size(0.5, 0.28, 0.32));
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
    const doorW = num(this.options.doorWidth, 2.12);
    const floorTop = num(this.options.floorTop, 0.18);
    const doorClearH = num(this.options.doorClearHeight, 3.95);
    this.mesh = new THREE.Group();
    this.mesh.name = this.name || "VillageHouseCollider";
    Object.assign(this.mesh.userData ||= {}, { isVillageHouseCollider: true, useAuthoredY: true });
    addCollider(this.mesh, this, "house_floor_low_flush", [0, floorTop - 0.06, 0], [w, 0.12, d]);
    addCollider(this.mesh, this, "house_back_wall", [0, h / 2, -d / 2], [w, h, t]);
    addCollider(this.mesh, this, "house_left_wall", [-w / 2, h / 2, 0], [t, h, d]);
    addCollider(this.mesh, this, "house_right_wall", [w / 2, h / 2, 0], [t, h, d]);
    addCollider(this.mesh, this, "house_front_left_jamb", [-(doorW / 2 + (w - doorW) / 4), h / 2, d / 2], [(w - doorW) / 2, h, t]);
    addCollider(this.mesh, this, "house_front_right_jamb", [(doorW / 2 + (w - doorW) / 4), h / 2, d / 2], [(w - doorW) / 2, h, t]);
    addCollider(this.mesh, this, "house_high_lintel_only", [0, (doorClearH + h) / 2, d / 2], [doorW, h - doorClearH, t]);
    addFurniture(this.mesh, this);
    this.mesh.position.copy(this.position.vector3());
    this.mesh.position.y = num(this.options.groundY ?? this.mesh.position.y, this.mesh.position.y);
    this.mesh.rotation.y = num(this.rotation?.y, 0);
    await olam.hoyseef(this);
    this.mesh.updateMatrixWorld(true);
    this.mesh.traverse(child => { if (child.isMesh) olam.worldOctree?.addObject(child); });
    this.isReady = true;
  }
}
