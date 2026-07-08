// B"H
import { addEntity } from "../core/StudioState.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { placeObject } from "./ObjectPlacement.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { placeBuilding } from "./BuildingPlacement.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { placeDoor } from "./DoorPlacement.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { placeNpc } from "./NpcPlacement.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { placeAnimal } from "./AnimalPlacement.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
const FACTORIES = { object:placeObject, building:placeBuilding, door:placeDoor, npc:placeNpc, animal:placeAnimal };
const COLLECTIONS = { object:"objects", building:"buildings", door:"doors", npc:"npcs", animal:"animals" };
export function place(project, kind, props = {}) {
  const factory = FACTORIES[kind] || placeObject;
  return addEntity(project, COLLECTIONS[kind] || "objects", factory(props));
}
export default { place };
