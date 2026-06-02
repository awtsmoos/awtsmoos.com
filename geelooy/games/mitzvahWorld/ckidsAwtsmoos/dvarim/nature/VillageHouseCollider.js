// B"H
/**
 * @file VillageHouseCollider.js
 * @description
 * Chapter 148: House physics matches the visible raised floor.
 *
 * The screenshot showed the player levitating because interior blockers were
 * huge and the visible house scale did not match the collision floor. This file
 * keeps the cottage simple: raised floor top, small doorway gap, small regular
 * furniture colliders. Future AI: do not add the decorative house mesh to the
 * octree; tune these cuboids instead.
 */
import Domem from "../../chayim/domem/index.js";
import * as THREE from "/games/scripts/build/three.module.js";

const num = (v, f = 0) => Number.isFinite(Number(v)) ? Number(v) : f;
const mat = new THREE.MeshBasicMaterial({ visible: false, transparent: true, opacity: 0 });

function addCollider(root, owner, name, pos, size) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), mat.clone());
  mesh.name = name;
  mesh.position.set(...pos);
  Object.assign(mesh.userData ||= {}, { isSolid: true, isVillageHouseCollider: true });
  mesh.nivraAwtsmoos = owner;
  root.add(mesh);
  return mesh;
}

function addInterior(root, owner) {
  addCollider(root, owner, "solid_inner_table", [0, 0.64, -2.2], [2.5, 0.65, 1.8]);
  addCollider(root, owner, "solid_inner_shelf", [-12.25, 1.85, 1.0], [1.65, 3.1, 2.8]);
  addCollider(root, owner, "solid_inner_bed", [10.3, 0.62, 3.1], [3.0, 0.72, 2.1]);
  addCollider(root, owner, "solid_inner_cabinet", [8.5, 1.8, -8.5], [2.2, 3.2, 1.3]);
}

export default class VillageHouseCollider extends Domem {
  type = "villageHouseCollider";

  constructor(op = {}, olam) {
    super({ ...op, golem: null, isSolid: true, interactable: false }, olam);
    this.options = op;
  }

  async heescheel(olam) {
    this.olam = olam;
    const w = num(this.options.width, 34);
    const d = num(this.options.depth, 23);
    const h = num(this.options.height, 12.6);
    const t = num(this.options.thickness, 0.85);
    const doorW = num(this.options.doorWidth, 3.1);
    const floorTop = num(this.options.floorTop, 0.4);
    this.mesh = new THREE.Group();
    this.mesh.name = this.name || "VillageHouseCollider";
    addCollider(this.mesh, this, "house_floor", [0, floorTop - 0.05, 0], [w, 0.1, d]);
    addCollider(this.mesh, this, "house_back_wall", [0, h / 2, -d / 2], [w, h, t]);
    addCollider(this.mesh, this, "house_left_wall", [-w / 2, h / 2, 0], [t, h, d]);
    addCollider(this.mesh, this, "house_right_wall", [w / 2, h / 2, 0], [t, h, d]);
    addCollider(this.mesh, this, "house_front_left", [-(doorW / 2 + (w - doorW) / 4), h / 2, d / 2], [(w - doorW) / 2, h, t]);
    addCollider(this.mesh, this, "house_front_right", [(doorW / 2 + (w - doorW) / 4), h / 2, d / 2], [(w - doorW) / 2, h, t]);
    addCollider(this.mesh, this, "house_front_lintel", [0, h - 2.1, d / 2], [doorW, 4.2, t]);
    addCollider(this.mesh, this, "house_roof_stop", [0, h + 0.6, 0], [w + 2.8, 0.5, d + 2.8]);
    addInterior(this.mesh, this);
    this.mesh.position.copy(this.position.vector3());
    this.mesh.rotation.y = num(this.rotation?.y, 0);
    await olam.hoyseef(this);
    this.mesh.traverse(child => { if (child.isMesh) olam.worldOctree?.addObject(child); });
    this.isReady = true;
  }
}
