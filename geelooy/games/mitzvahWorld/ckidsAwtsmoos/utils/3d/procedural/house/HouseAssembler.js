// B"H
/**
 * @module HouseAssembler
 * @description
 * 🏛️ THE GRAND ASSEMBLY — PURE DATA ORCHESTRATION 🏛️
 * 
 * Collects data instructions from all sub-builders (walls, roof, floor, 
 * steps, mezuzahs), then passes the unified instruction set to 
 * BlueprintCompiler which is the ONLY module that touches THREE.js.
 * 
 * Architecture:
 *   Blueprint JSON → WallBuilder/RoofBuilder/FloorBuilder/etc (pure data)
 *                  → HouseAssembler (aggregates data)
 *                  → BlueprintCompiler (THREE.js materialization)
 */
import BlueprintCompiler from "./BlueprintCompiler.js";
import WallBuilder from "./WallBuilder.js";
import RoofBuilder from "./RoofBuilder.js";
import FloorBuilder from "./FloorBuilder.js";
import StepsBuilder from "./StepsBuilder.js";
import MezuzahBuilder from "./MezuzahBuilder.js";
import JSONEvaluator from "../../../data/JSONEvaluator.js";

export default class HouseAssembler {
    /**
     * Legacy convenience method.
     */
    static generate(width = 14, height = 8, depth = 14, thickness = 1, doorW = 4, doorH = 5.5) {
        return HouseAssembler.generateFromBlueprint({
            width, height, depth, wallThickness: thickness,
            entrances: [{ wall: 'front', width: doorW, height: doorH, offset: 0 }]
        });
    }

    /**
     * Primary entry point: blueprint → data instructions → compiled geometry.
     * @param {Object} rawBlueprint
     * @returns {THREE.BufferGeometry}
     */
    static generateFromBlueprint(rawBlueprint) {
        try {
            // B"H: The blueprint is evaluated entirely! Meaning it can contain dynamic logic,
            // variables, math operations all mapped via pure JSON syntax.
            const blueprint = JSONEvaluator.evaluate(rawBlueprint, {
                defaultWidth: 12,
                defaultHeight: 12,
                defaultThickness: 1
            });

            console.log("B\"H - ⚡ Assembling House Data Instructions...", blueprint);

            // Phase 1: Collect pure data instructions from every builder
            const allInstructions = [
                ...WallBuilder.build(blueprint),
                ...RoofBuilder.build(blueprint),
                ...FloorBuilder.build(blueprint),
                ...StepsBuilder.build(blueprint),
                ...MezuzahBuilder.build(blueprint)
            ];

            console.log(`B"H - ⚡ Total instructions: ${allInstructions.length}. Compiling to THREE.js...`);

            // Phase 2: Compile the pure data into actual geometry (only THREE.js call)
            const geometry = BlueprintCompiler.compile(allInstructions);

            console.log("B\"H - ⚡ House Compilation Successful. Ready to serve!");
            return geometry;

        } catch(e) {
            console.error("B\"H - ⚡ House Assembler Failed:", e);
            // Fallback: let BlueprintCompiler create a default box
            return BlueprintCompiler.compile([]);
        }
    }

    /**
     * Expose the raw data instructions without compiling — useful for debugging
     * or for future JSON export/import features.
     */
    static getInstructions(blueprint) {
        return [
            ...WallBuilder.build(blueprint),
            ...RoofBuilder.build(blueprint),
            ...FloorBuilder.build(blueprint),
            ...StepsBuilder.build(blueprint),
            ...MezuzahBuilder.build(blueprint)
        ];
    }
}
