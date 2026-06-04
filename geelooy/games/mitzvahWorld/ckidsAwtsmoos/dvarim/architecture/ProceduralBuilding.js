// B"H
/**
 * @file ProceduralBuilding.js
 * @description
 * Chapter 339: Every house enters through the clean-collider architect.
 *
 * The Awtsmoos burns the stale import so the next refresh receives brick visual
 * walls, gable roofs, and hidden carved collision shells.
 */
import Domem from "../../chayim/domem/index.js";
import BuildingManifestor from "./methods/BuildingManifestor.js?v=clean-collider-brick-house-20260603-bh339";
import { HousePresets } from "../../utils/3d/procedural/house/data/HousePresets.js";

export default class ProceduralBuilding extends Domem {
  type = "proceduralBuilding";
  static itemName = "Building Blueprint";
  static description = "Spawns a procedural structure with brick walls, passable doors, and roofs.";
  static isBuildable = true;

  constructor(op = {}, olam) {
    super(op, olam);
    let blueprint = op.blueprint || op.itemData?.blueprint || {};
    const presetName = op.housePreset || op.itemData?.housePreset;
    const presetArg = op.housePresetArg || op.itemData?.housePresetArg;
    if (presetName && HousePresets[presetName]) {
      const presetData = HousePresets[presetName];
      blueprint = typeof presetData === 'function' ? presetData(presetArg) : JSON.parse(JSON.stringify(presetData));
    }
    this.blueprint = blueprint;
    this.blueprint.width ||= 12;
    this.blueprint.height ||= 6;
    this.blueprint.depth ||= 12;
    this.blueprint.wallThickness ||= 1;
    if (!this.blueprint.entrances || this.blueprint.entrances.length === 0) {
      this.blueprint.entrances = [{ wall: 'front', width: 4, height: 6, offset: 0 }];
    }
  }

  async heescheel(olam) {
    this.olam = olam;
    await BuildingManifestor.manifest(this);
  }
}
