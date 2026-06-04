// B"H
/**
 * @file VillageStonePath.js
 * @description
 * Chapter 30: The road class becomes a doorway into the shared library.
 * All cobble geometry, material language, and path scattering now live in
 * `geelooy/libs/awtsmoos3d/path/cobblePath.js`; this file simply manifests it
 * as a Nivra inside Mitzvah World.
 */
import Domem from "../../chayim/domem/index.js";
import { createCobblePath } from "../../../../../libs/awtsmoos3d/path/cobblePath.js";

export default class VillageStonePath extends Domem {
  type = "villageStonePath";
  constructor(op = {}, olam) {
    super({ ...op, isSolid: false, interactable: false }, olam);
    this.options = op;
    this.useAuthoredY = true;
  }

  async heescheel(olam) {
    this.mesh = createCobblePath(this.options);
    await olam.hoyseef(this);
    this.isReady = true;
  }
}
