// B"H
/**
 * @module HouseAssembler
 * @description
 * Chapter 342: The house has two bodies and fresh limbs.
 *
 * The visible body is brick, trim, roof, floor, and steps. The collision body is
 * clean mercy: slab walls with carved doors, floors, and steps only. Every import
 * carries the new cache seal so stale builders cannot return.
 */
import BlueprintCompiler from "./BlueprintCompiler.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import WallBuilder from "./WallBuilder.js?compact=true&v=brick-wall-and-clean-collider-20260603-bh342";
import RoofBuilder from "./RoofBuilder.js?compact=true&v=clean-gable-roof-20260603-bh342";
import FloorBuilder from "./FloorBuilder.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import StepsBuilder from "./StepsBuilder.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import MezuzahBuilder from "./MezuzahBuilder.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import DoorwayTrimBuilder from "./DoorwayTrimBuilder.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import JSONEvaluator from "../../../data/JSONEvaluator.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

function evaluated(rawBlueprint) {
  return JSONEvaluator.evaluate(rawBlueprint, { defaultWidth: 12, defaultHeight: 12, defaultThickness: 1 });
}
function roomsOf(blueprint) { return blueprint.rooms || [blueprint]; }
function withRoomOffset(room, instructions) {
  if (!room.offset || !Array.isArray(room.offset)) return instructions;
  for (const instr of instructions) {
    instr.modifiers ||= [];
    instr.modifiers.push({ type: 'translate', x: room.offset[0] || 0, y: room.offset[1] || 0, z: room.offset[2] || 0 });
  }
  return instructions;
}
function visualInstructions(room) {
  return [
    ...WallBuilder.build(room),
    ...(room.hasRoof !== false ? RoofBuilder.build(room) : []),
    ...FloorBuilder.build(room),
    ...StepsBuilder.build(room),
    ...DoorwayTrimBuilder.build(room),
    ...MezuzahBuilder.build(room)
  ];
}
function colliderInstructions(room) {
  return [
    ...WallBuilder.buildCollider(room),
    ...FloorBuilder.build(room).map(i => ({ ...i, materialGroup: 4 })),
    ...StepsBuilder.build(room).map(i => ({ ...i, materialGroup: 4 }))
  ];
}

export default class HouseAssembler {
  static generateFromBlueprint(rawBlueprint) {
    try { return BlueprintCompiler.compile(HouseAssembler.getInstructions(evaluated(rawBlueprint))); }
    catch (error) { console.error("B\"H - House Assembler visual failed:", error); return BlueprintCompiler.compile([]); }
  }

  static generateColliderFromBlueprint(rawBlueprint) {
    try { return BlueprintCompiler.compile(HouseAssembler.getColliderInstructions(evaluated(rawBlueprint))); }
    catch (error) { console.error("B\"H - House Assembler collider failed:", error); return BlueprintCompiler.compile([]); }
  }

  static generate(rawBlueprint) { return HouseAssembler.generateFromBlueprint(rawBlueprint); }

  static getInstructions(blueprint) {
    const all = [];
    for (const room of roomsOf(blueprint)) all.push(...withRoomOffset(room, visualInstructions(room)));
    return all;
  }

  static getColliderInstructions(blueprint) {
    const all = [];
    for (const room of roomsOf(blueprint)) all.push(...withRoomOffset(room, colliderInstructions(room)));
    return all;
  }
}
