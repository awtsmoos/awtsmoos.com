// B"H
/**
 * @module GeometryManager
 * @description
 * Chapter 344: The geometry registry remembers the two-bodied house.
 *
 * If any legacy path asks for HouseGeometry, it now receives the same fresh
 * assembler used by procedural buildings. No stale roof or wall law remains in
 * the registry gate.
 */
import HouseAssembler from "../../utils/3d/procedural/house/HouseAssembler.js?v=brick-visual-clean-collider-20260603-bh344";
import GrassPatchAssembler from "../../utils/3d/procedural/nature/GrassPatchAssembler.js";
import RockAssembler from "../../utils/3d/procedural/nature/RockAssembler.js";
import CloudAssembler from "../../utils/3d/procedural/nature/CloudAssembler.js";
import StoneWell from "../methods/procedural/Structures/StoneWell.js";
import DoorGeometry from "../../utils/3d/procedural/Door.js";
import LampPost from "../../utils/3d/procedural/Structures/LampPost.js";
import Dome from "../../utils/3d/procedural/Dome.js";
import Island from "../../utils/3d/procedural/Island.js";
import Labyrinth from "../../utils/3d/procedural/Labyrinth.js";
import Pyramid from "../../utils/3d/procedural/Pyramid.js";
import Arch from "../../utils/3d/procedural/Arch.js";
import Pillar from "../../utils/3d/procedural/Pillar.js";
import Wall from "../../utils/3d/procedural/Wall.js";

const registry = new Map();

export default class GeometryManager {
  static init() {
    if (this._initialized) return;
    try {
      this.register("HouseGeometry", (...args) => HouseAssembler.generateFromBlueprint(...args));
      this.register("HouseColliderGeometry", (...args) => HouseAssembler.generateColliderFromBlueprint(...args));
      this.register("GrassPatchGeometry", (...args) => GrassPatchAssembler.generate(...args));
      this.register("RockGeometry", (...args) => RockAssembler.generate(...args));
      this.register("CloudGeometry", (...args) => CloudAssembler.generate(...args));
      this.register("WellGeometry", (...args) => StoneWell.generate(...args));
      this.register("DoorGeometry", (...args) => DoorGeometry.generate(...args));
      this.register("LampPostGeometry", (...args) => LampPost.generate(...args));
      this.register("DomeGeometry", (...args) => Dome.generate(...args));
      this.register("IslandGeometry", (...args) => Island.generate(...args));
      this.register("LabyrinthGeometry", (...args) => Labyrinth.generate(...args));
      this.register("PyramidGeometry", (...args) => Pyramid.generate(...args));
      this.register("ArchGeometry", (...args) => Arch.generate(...args));
      this.register("PillarGeometry", (...args) => Pillar.generate(...args));
      this.register("WallGeometry", (...args) => Wall.generate(...args));
    } catch (error) {
      console.error("B\"H - GeometryManager Init Failed:", error);
    }
    this._initialized = true;
  }

  static register(typeName, generatorFn) {
    if (registry.has(typeName)) console.warn(`B"H: Geometry type '${typeName}' is being overwritten.`);
    registry.set(typeName, generatorFn);
  }

  static has(typeName) {
    this.init();
    return registry.has(typeName);
  }

  static create(typeName, args) {
    this.init();
    try {
      const generator = registry.get(typeName);
      if (!generator) {
        console.error(`B"H: Geometry type '${typeName}' not found in registry.`);
        return null;
      }
      return generator(...args);
    } catch (error) {
      console.error(`B"H - Critical failure creating geometry ${typeName}:`, error);
      return null;
    }
  }
}
