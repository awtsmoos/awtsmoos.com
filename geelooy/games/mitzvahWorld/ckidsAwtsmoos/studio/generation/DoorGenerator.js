// B"H
import { createDoor } from "../core/StudioState.js";
export function generateDoorForBuilding(building = {}) { return createDoor({ name:`${building.name || "Building"} Door`, position:building.position || { x:0, y:0, z:1 } }); }
export default { generateDoorForBuilding };
