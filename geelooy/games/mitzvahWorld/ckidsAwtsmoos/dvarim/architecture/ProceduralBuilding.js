
// B"H
import Domem from "../../chayim/domem/index.js";
import BuildingManifestor from "./methods/BuildingManifestor.js";
import { HousePresets } from "../../utils/3d/procedural/house/data/HousePresets.js";

/**
 * ProceduralBuilding - The Vessel of Dwellings
 * Transcends basic shapes to build fully mathematical architecture equipped with functional parts.
 */
export default class ProceduralBuilding extends Domem {
    type = "proceduralBuilding";
    static itemName = "Building Blueprint";
    static description = "Spawns a massive procedural structure with doors and roofs.";
    static isBuildable = true;

    constructor(op, olam) {
        super(op, olam);
        
        let blueprint = op.blueprint || op.itemData?.blueprint || {};

        // B"H: Preset Application System
        const presetName = op.housePreset || op.itemData?.housePreset;
        const presetArg  = op.housePresetArg || op.itemData?.housePresetArg;

        if (presetName && HousePresets[presetName]) {
            const presetData = HousePresets[presetName];
            if (typeof presetData === 'function') {
                blueprint = presetData(presetArg);
            } else {
                blueprint = JSON.parse(JSON.stringify(presetData));
            }
        }

        this.blueprint = blueprint;
        
        // Base protection metrics
        this.blueprint.width = this.blueprint.width || 12;
        this.blueprint.height = this.blueprint.height || 6;
        this.blueprint.depth = this.blueprint.depth || 12;
        this.blueprint.wallThickness = this.blueprint.wallThickness || 1;
        // B"H: Give all houses a default entrance if none is provided
        if (!this.blueprint.entrances || this.blueprint.entrances.length === 0) {
            this.blueprint.entrances = [{
                wall: 'front',
                width: 4,      // A little bigger than the player
                height: 6,     
                offset: 0
            }];
        }
    }

    async heescheel(olam) {
        this.olam = olam;
        await BuildingManifestor.manifest(this);
    }
}
