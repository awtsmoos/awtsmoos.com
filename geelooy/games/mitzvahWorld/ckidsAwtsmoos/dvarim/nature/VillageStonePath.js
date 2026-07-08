// B"H
/**
 * @file VillageStonePath.js
 * @description
 * Chapter 80: The stone path passes the renderer to the shader snapshot forge.
 * Cobble and dirt textures are baked once, then reused by instanced Lambert.
 */
import Domem from "../../chayim/domem/index.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { createCobblePath } from "../../../../../libs/awtsmoos3d/path/cobblePath.js?compact=true&v=shader-path-20260604-bh437";

export default class VillageStonePath extends Domem {
  type = "villageStonePath";
  constructor(op = {}, olam) {
    super({ ...op, isSolid: false, interactable: false }, olam);
    this.options = op;
    this.useAuthoredY = true;
  }

  async heescheel(olam) {
    this.mesh = createCobblePath(this.options, { renderer: olam?.renderer });
    await olam.hoyseef(this);
    this.isReady = true;
  }
}
