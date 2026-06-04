// B"H
/**
 * @file VillageSkyLayers.js
 * @description
 * Chapter 78: The sky wrapper hands the renderer to the cloud shader snapshot.
 * Clouds bake once; the runtime carries only a frozen texture on a plane.
 */
import Domem from "../../chayim/domem/index.js";
import { createGoldenSkyLayers } from "../../../../../libs/awtsmoos3d/sky/goldenSky.js?v=shader-sky-20260604-bh437";

export default class VillageSkyLayers extends Domem {
  type = "villageSkyLayers";
  constructor(op = {}, olam) {
    super({ ...op, isSolid: false, interactable: false }, olam);
    this.options = op;
    this.useAuthoredY = true;
  }

  async heescheel(olam) {
    this.mesh = createGoldenSkyLayers(this.options, { renderer: olam?.renderer });
    await olam.hoyseef(this);
    this.isReady = true;
  }
}
