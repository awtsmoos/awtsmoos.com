// B"H
/**
 * @file VillagePictureProp.js
 * @description
 * Chapter 117: Every village picture receives one honest earthly placement.
 * The Awtsmoos does not shove the whole cottage repeatedly by changing world
 * boxes. It builds the decorative group, measures its local lowest point once,
 * and sets the parent Y so that lowest point kisses `groundY + groundLift`.
 */
import Domem from "../../chayim/domem/index.js";
import * as THREE from "/games/scripts/build/three.module.js";
import { markDecorative } from "./villagePicture/geometryKit.js";
import { VILLAGE_PICTURE_RECIPES } from "./villagePicture/recipeMap.js";

const num = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;

function localMinY(root) {
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  return Number.isFinite(box.min.y) && !box.isEmpty() ? box.min.y : 0;
}

export default class VillagePictureProp extends Domem {
  type = "villagePictureProp";
  heesHawveh = false;

  constructor(op = {}, olam) {
    super({ ...op, isSolid: false, interactable: false, heesHawveh: false }, olam);
    this.options = op;
  }

  async heescheel(olam) {
    this.olam = olam;
    const kind = this.options.kind || "bench";
    const recipe = VILLAGE_PICTURE_RECIPES[kind] || VILLAGE_PICTURE_RECIPES.bench;
    const p = this.position || {};
    const r = this.rotation || {};
    const groundY = num(this.options.groundY ?? this.options.worldGroundY, 0);
    const lift = num(this.options.groundLift, 0);
    this.mesh = recipe(this.options);
    this.mesh.name = this.name || `VillagePictureProp_${kind}`;
    this.mesh.rotation.set(num(r.x), num(r.y), num(r.z));
    this.mesh.scale.setScalar(num(this.options.scale, 1));
    this.mesh.updateMatrixWorld(true);
    const y = groundY + lift - localMinY(this.mesh);
    this.mesh.position.set(num(p.x), y, num(p.z));
    this.mesh.userData ||= {};
    this.mesh.userData.awtsmoosGrounding = { mode: "local-min-once", groundY, lift, y };
    markDecorative(this.mesh);
    await olam.hoyseef(this);
    this.isReady = true;
  }

  heesHawvoos() {}
}
