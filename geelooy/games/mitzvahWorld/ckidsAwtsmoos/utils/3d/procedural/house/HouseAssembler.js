
// B"H
/**
 * @module HouseAssembler
 * @description
 * 🏛️ THE GRAND ASSEMBLY — PURE DATA ORCHESTRATION 🏛️
 */
import BlueprintCompiler from "./BlueprintCompiler.js";
import WallBuilder from "./WallBuilder.js";
import RoofBuilder from "./RoofBuilder.js";
import FloorBuilder from "./FloorBuilder.js";
import StepsBuilder from "./StepsBuilder.js";
import MezuzahBuilder from "./MezuzahBuilder.js";
import DoorwayTrimBuilder from "./DoorwayTrimBuilder.js";
import JSONEvaluator from "../../../data/JSONEvaluator.js";

export default class HouseAssembler {
    static generateFromBlueprint(rawBlueprint) {
        try {
            const blueprint = JSONEvaluator.evaluate(rawBlueprint, {
                defaultWidth: 12,
                defaultHeight: 12,
                defaultThickness: 1
            });

            const rooms = blueprint.rooms || [blueprint];
            const allInstructions = [];

            rooms.forEach(room => {
                const roomInstructions = [
                    ...WallBuilder.build(room),
                    ...(room.hasRoof !== false ? RoofBuilder.build(room) : []),
                    ...FloorBuilder.build(room),
                    ...StepsBuilder.build(room),
                    ...DoorwayTrimBuilder.build(room),
                    ...MezuzahBuilder.build(room)
                ];

                if (room.offset && Array.isArray(room.offset)) {
                    roomInstructions.forEach(instr => {
                        if (!instr.modifiers) instr.modifiers = [];
                        instr.modifiers.push({
                            type: 'translate',
                            x: room.offset[0] || 0,
                            y: room.offset[1] || 0,
                            z: room.offset[2] || 0
                        });
                    });
                }
                allInstructions.push(...roomInstructions);
            });

            return BlueprintCompiler.compile(allInstructions);
        } catch(e) {
            console.error("B\"H - ⚡ House Assembler Failed:", e);
            return BlueprintCompiler.compile([]);
        }
    }

    static getInstructions(blueprint) {
        const rooms = blueprint.rooms || [blueprint];
        const allInstructions = [];
        rooms.forEach(room => {
            const roomInstructions = [
                ...WallBuilder.build(room),
                ...(room.hasRoof !== false ? RoofBuilder.build(room) : []),
                ...FloorBuilder.build(room),
                ...StepsBuilder.build(room),
                ...DoorwayTrimBuilder.build(room),
                ...MezuzahBuilder.build(room)
            ];
            if (room.offset && Array.isArray(room.offset)) {
                roomInstructions.forEach(instr => {
                    if (!instr.modifiers) instr.modifiers = [];
                    instr.modifiers.push({
                        type: 'translate',
                        x: room.offset[0] || 0,
                        y: room.offset[1] || 0,
                        z: room.offset[2] || 0
                    });
                });
            }
            allInstructions.push(...roomInstructions);
        });
        return allInstructions;
    }
}
