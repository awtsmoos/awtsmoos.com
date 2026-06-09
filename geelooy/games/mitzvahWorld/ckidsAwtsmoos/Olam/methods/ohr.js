// B"H
/**
 * @module LuminaryManifestor
 * @description Chapter 450: The light method becomes a facade over the Emerald
 * golden-hour lighting profile.
 */
import { applyEmeraldLighting } from './lighting/emeraldLightingProfile.js';
export default class LuminaryManifestor {
  ohr() {
    if (!this.scene || this.enlightened) return;
    this.enlightened = true;
    this.mainSun = applyEmeraldLighting(this.scene);
  }
}
