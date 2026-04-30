
// B"H
import Domem from "../../chayim/domem/index.js";
import BuildingManifestor from "./methods/BuildingManifestor.js";

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
        this.blueprint = op.blueprint || op.itemData?.blueprint || {};
        
        // Base protection metrics
        this.blueprint.width = this.blueprint.width || 12;
        this.blueprint.height = this.blueprint.height || 6;
        this.blueprint.depth = this.blueprint.depth || 12;
        this.blueprint.wallThickness = this.blueprint.wallThickness || 1;
        this.blueprint.entrances = this.blueprint.entrances || [];
    }

    async heescheel(olam) {
        this.olam = olam;
        await BuildingManifestor.manifest(this);
    }
}
