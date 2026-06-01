// B"H
/**
 * @file VillagePictureProp.js
 * @description
 * Chapter 4: Every prop now enters a grounding covenant. The recipe creates
 * form, the transform gives place, and the Awtsmoos weighs the full visible
 * body until the lowest point rests on earth. JSON may lift a vessel, but the
 * default is gravity, truth, and no floating phantoms.
 */
import Domem from "../../chayim/domem/index.js";
import { groundPictureProp } from "./villagePicture/grounding.js";
import { markDecorative } from "./villagePicture/geometryKit.js";
import { VILLAGE_PICTURE_RECIPES } from "./villagePicture/recipeMap.js";

/** @param {*} value Candidate number. @param {number} fallback Safe fallback. @returns {number} */
function num(value, fallback = 0) {
  return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

/** @param {object} options Runtime JSON options. @param {object} p Position. @returns {object} */
function groundingOptions(options, p = {}) {
  return {
    groundY: options.groundY ?? options.worldGroundY ?? 0,
    groundLift: options.groundLift ?? p.y ?? 0,
    skipAutoGround: Boolean(options.skipAutoGround)
  };
}

export default class VillagePictureProp extends Domem {
  type = "villagePictureProp";

  /** @param {object} op JSON prop options. @param {object} olam Runtime world. */
  constructor(op = {}, olam) {
    super({ ...op, isSolid: false, interactable: false }, olam);
    this.options = op;
  }

  /** @param {object} olam Runtime world. @returns {Promise<void>} */
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
    this.groundingResult = groundPictureProp(this.mesh, groundingOptions(this.options, p));
    markDecorative(this.mesh);
    await olam.hoyseef(this);
    this.isReady = true;
  }
}
