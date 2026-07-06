// B"H
import { createDoor } from "../core/StudioState.js";
import { createDoorInteractionRules } from "./DoorInteractionRules.js";
export function editDoor(door = {}, patch = {}) { return { ...createDoor({ ...door, ...patch }), interaction:createDoorInteractionRules(patch) }; }
export default { editDoor };
