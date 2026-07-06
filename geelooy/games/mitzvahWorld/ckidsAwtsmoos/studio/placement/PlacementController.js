// B"H
import { addEntity } from "../core/StudioState.js";
import { placeObject } from "./ObjectPlacement.js";
import { placeBuilding } from "./BuildingPlacement.js";
import { placeDoor } from "./DoorPlacement.js";
import { placeNpc } from "./NpcPlacement.js";
import { placeAnimal } from "./AnimalPlacement.js";
const FACTORIES = { object:placeObject, building:placeBuilding, door:placeDoor, npc:placeNpc, animal:placeAnimal };
const COLLECTIONS = { object:"objects", building:"buildings", door:"doors", npc:"npcs", animal:"animals" };
export function place(project, kind, props = {}) {
  const factory = FACTORIES[kind] || placeObject;
  return addEntity(project, COLLECTIONS[kind] || "objects", factory(props));
}
export default { place };
