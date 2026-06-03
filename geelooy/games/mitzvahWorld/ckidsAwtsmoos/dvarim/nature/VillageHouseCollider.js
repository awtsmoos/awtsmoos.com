// B"H
/**
 * @file VillageHouseCollider.js
 * @description
 * Chapter 181: The doorway is open in collision, not only in sight.
 *
 * The visual door could swing, but the old lintel collider began near the floor
 * and became an invisible wall. The Awtsmoos now leaves a full human passage:
 * floor is solid, walls are simple, furniture is solid, and the front wall only
 * has side jambs plus a true high lintel. Future AI: never put a center collider
 * inside the door opening.
 */
import Domem from "../../chayim/domem/index.js";
import * as THREE from "/games/scripts/build/three.module.js";

const num = (v, f = 0) => Number.isFinite(Number(v)) ? Number(v) : f;
const mat = new THREE.MeshBasicMaterial({ visible: false, transparent: true, opacity: 0 });

function addCollider(root, owner, name, pos, size) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), mat.clone());
  mesh.name = name;
  mesh.position.set(...pos);
  Object.assign(mesh.userData ||= {}, { isSolid: true, isVillageHouseCollider: true, useAuthoredY: true });
  mesh.nivraAwtsmoos = owner;
  root.add(mesh);
  return mesh;
}

function addInterior(root, owner) {
  addCollider(root, owner, "solid_inner_table", [0, 0.74, -2.2], [2.3, 0.55, 1.55]);
  addCollider(root, owner, "solid_inner_shelf", [-12.25, 1.65, 1.0], [1.35, 2.65, 2.35]);
  addCollider(root, owner, "solid_inner_bed", [10.3, 0.72, 3.1], [2.65, 0.52, 1.85]);
  addCollider(root, owner, "solid_inner_cabinet", [8.5, 1.6, -8.5], [1.85, 2.65, 1.05]);
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
    const h = num(this.options.height, 12.6);
    const t = num(this.options.thickness, 0.85);
    const doorW = num(this.options.doorWidth, 2.35);
    const floorTop = num(this.options.floorTop, 0.4);
    const doorClearH = num(this.options.doorClearHeight, 4.45);
    this.mesh = new THREE.Group();
    this.mesh.name = this.name || "VillageHouseCollider";
    Object.assign(this.mesh.userData ||= {}, { isVillageHouseCollider: true, useAuthoredY: true });
    addCollider(this.mesh, this, "house_floor", [0, floorTop - 0.08, 0], [w, 0.16, d]);
    addCollider(this.mesh, this, "house_back_wall", [0, h / 2, -d / 2], [w, h, t]);
    addCollider(this.mesh, this, "house_left_wall", [-w / 2, h / 2, 0], [t, h, d]);
    addCollider(this.mesh, this, "house_right_wall", [w / 2, h / 2, 0], [t, h, d]);
    addCollider(this.mesh, this, "house_front_left", [-(doorW / 2 + (w - doorW) / 4), h / 2, d / 2], [(w - doorW) / 2, h, t]);
    addCollider(this.mesh, this, "house_front_right", [(doorW / 2 + (w - doorW) / 4), h / 2, d / 2], [(w - doorW) / 2, h, t]);
    addCollider(this.mesh, this, "house_high_lintel_only", [0, (doorClearH + h) / 2, d / 2], [doorW, h - doorClearH, t]);
    addCollider(this.mesh, this, "house_roof_stop", [0, h + 0.6, 0], [w + 2.8, 0.5, d + 2.8]);
    addInterior(this.mesh, this);
    this.mesh.position.copy(this.position.vector3());
    this.mesh.rotation.y = num(this.rotation?.y, 0);
    await olam.hoyseef(this);
    this.mesh.updateMatrixWorld(true);
    this.mesh.traverse(child => { if (child.isMesh) olam.worldOctree?.addObject(child); });
    this.isReady = true;
  }
}
