// B"H
/**
 * @file VillageCottage.js
 * @description
 * Chapter 81: The cottage wrapper passes the renderer into shader-baked walls.
 * Plaster, roof, and door textures are snapshots from custom shaders.
 */
import Domem from "../../chayim/domem/index.js";
import { createCottage } from "../../../../../libs/awtsmoos3d/buildings/cottage.js?v=shader-cottage-20260604-bh437";

export default class VillageCottage extends Domem {
  type = "villageCottage";
  constructor(op = {}, olam) {
    super({ ...op, isSolid: false, interactable: false }, olam);
    this.options = op;
    this.useAuthoredY = true;
  }

  async heescheel(olam) {
    this.mesh = createCottage(this.options, { renderer: olam?.renderer });
    await olam.hoyseef(this);
    this.isReady = true;
  }
}
