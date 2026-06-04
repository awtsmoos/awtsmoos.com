// B"H
/**
 * @file VillageCottage.js
 * @description
 * Chapter 48: The cottage kit enters the world as a Nivra.
 * This thin class keeps village data clean while the reusable Lambert building
 * generator lives in `geelooy/libs/awtsmoos3d/buildings/cottage.js`.
 */
import Domem from "../../chayim/domem/index.js";
import { createCottage } from "../../../../../libs/awtsmoos3d/buildings/cottage.js";

export default class VillageCottage extends Domem {
  type = "villageCottage";
  constructor(op = {}, olam) {
    super({ ...op, isSolid: false, interactable: false }, olam);
    this.options = op;
    this.useAuthoredY = true;
  }

  async heescheel(olam) {
    this.mesh = createCottage(this.options);
    await olam.hoyseef(this);
    this.isReady = true;
  }
}
