// B"H
import { proceduralCorePacket } from "./ProceduralCoreBridge.js";
import { awtsmoos3DRecipe } from "./Awtsmoos3DBridge.js";
export function proceduralBuilding(command = {}) { const recipe = command.procedural?.recipe || command.recipe || "building"; return recipe === "cottage" || recipe === "branch_house" ? awtsmoos3DRecipe(recipe, command.id, command) : proceduralCorePacket("building", command.id, command); }
