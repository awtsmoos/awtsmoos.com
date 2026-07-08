// B"H
/**
 * @file SectorResidencyManager.js
 * @description Chapter 459: the Awtsmoos reveals sectors by distance,
 * prediction, and hysteresis, without dragging the whole universe into RAM.
 */
import { sectorFromPoint, sectorDistanceSq, visitSectorRadius } from "../sector/SectorKey.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { bandForSectorDistance, DEFAULT_RESIDENCY_BANDS, maxLoadRadius } from "../bands/ResidencyBands.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { applyResidencyDiff, diffResidency } from "./ResidencyDiff.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
export class SectorResidencyManager {
  constructor({ sectorSize = 64, bands = DEFAULT_RESIDENCY_BANDS } = {}) {
    this.sectorSize = sectorSize;
    this.bands = bands;
    this.current = new Map();
    this.lastCenter = null;
    this.lastDiff = null;
  }
  desiredForPoint(x, z) {
    const center = sectorFromPoint(x, z, this.sectorSize);
    const desired = new Map();
    visitSectorRadius(center, maxLoadRadius(this.bands), sector => {
      const distance = Math.sqrt(sectorDistanceSq(center, sector));
      const band = bandForSectorDistance(distance, this.bands);
      if (band) desired.set(sector.key, band);
    });
    this.lastCenter = center;
    return desired;
  }
  update(x, z) {
    const desired = this.desiredForPoint(x, z);
    const diff = diffResidency(this.current, desired);
    applyResidencyDiff(this.current, diff);
    this.lastDiff = diff;
    return diff;
  }
  snapshot() {
    return {
      sectorSize:this.sectorSize,
      current:[...this.current].map(([key, band]) => ({ key, band:band.name })),
      lastCenter:this.lastCenter,
      lastDiff:this.lastDiff
    };
  }
}
export default SectorResidencyManager;
