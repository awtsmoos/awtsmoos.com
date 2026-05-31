// B"H
/**
 * @file VillagePictureProp.js
 * @description
 * Chapter 103: the village vessel now grounds itself. Each prop is created,
 * rotated, scaled, then snapped by its bounding box so the picture stops
 * floating and the world rests on the earth like a finished sentence.
 */
import Domem from "../../chayim/domem/index.js";
import { groundPictureProp } from "./villagePicture/grounding.js";
import { markDecorative } from "./villagePicture/geometryKit.js";
import { VILLAGE_PICTURE_RECIPES } from "./villagePicture/recipeMap.js";

function num(value, fallback = 0) {
  return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

export default class VillagePictureProp extends Domem {
  type = "villagePictureProp";
  constructor(op = {}, olam) {
    super({ ...op, isSolid: false, interactable: false }, olam);
    this.options = op;
  }

  async heescheel(olam) {
    const kind = this.options.kind || "bench";
    const recipe = VILLAGE_PICTURE_RECIPES[kind] || VILLAGE_PICTURE_RECIPES.bench;
    this.mesh = recipe(this.options);
    this.mesh.name = this.name || `VillagePictureProp_${kind}`;
    const p = this.position || {};
    const r = this.rotation || {};
    this.mesh.position.set(num(p.x), 0, num(p.z));
    this.mesh.rotation.set(num(r.x), num(r.y), num(r.z));
    this.mesh.scale.setScalar(num(this.options.scale, 1));
    groundPictureProp(this.mesh, { groundY: this.options.groundY, groundLift: this.options.groundLift ?? p.y });
    markDecorative(this.mesh);
    await olam.hoyseef(this);
    this.isReady = true;
  }
}
