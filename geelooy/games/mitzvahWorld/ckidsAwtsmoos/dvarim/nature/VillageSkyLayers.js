// B"H
/**
 * @file VillageSkyLayers.js
 * @description
 * Chapter 32: The sky becomes layered gold instead of a single flat thought.
 * The reusable `goldenSky` helper creates cloud wisps and horizon glow planes
 * that sit behind the Lambert village with almost no GPU cost.
 */
import Domem from "../../chayim/domem/index.js";
import { createGoldenSkyLayers } from "../../../../../libs/awtsmoos3d/sky/goldenSky.js";

export default class VillageSkyLayers extends Domem {
  type = "villageSkyLayers";
  constructor(op = {}, olam) {
    super({ ...op, isSolid: false, interactable: false }, olam);
    this.options = op;
    this.useAuthoredY = true;
  }

  async heescheel(olam) {
    this.mesh = createGoldenSkyLayers(this.options);
    await olam.hoyseef(this);
    this.isReady = true;
  }
}
