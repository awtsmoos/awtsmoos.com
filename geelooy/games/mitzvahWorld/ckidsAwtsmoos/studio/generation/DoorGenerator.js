// B"H
import { createDoor } from "../core/StudioState.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
export function generateDoorForBuilding(building = {}) { return createDoor({ name:`${building.name || "Building"} Door`, position:building.position || { x:0, y:0, z:1 } }); }
export default { generateDoorForBuilding };
