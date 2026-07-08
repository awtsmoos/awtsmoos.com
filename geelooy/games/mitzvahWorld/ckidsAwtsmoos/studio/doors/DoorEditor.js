// B"H
import { createDoor } from "../core/StudioState.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { createDoorInteractionRules } from "./DoorInteractionRules.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
export function editDoor(door = {}, patch = {}) { return { ...createDoor({ ...door, ...patch }), interaction:createDoorInteractionRules(patch) }; }
export default { editDoor };
