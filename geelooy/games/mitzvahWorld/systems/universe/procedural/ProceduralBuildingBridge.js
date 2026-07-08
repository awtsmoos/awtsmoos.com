// B"H
import { proceduralCorePacket } from "./ProceduralCoreBridge.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { awtsmoos3DRecipe } from "./Awtsmoos3DBridge.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
export function proceduralBuilding(command = {}) { const recipe = command.procedural?.recipe || command.recipe || "building"; return recipe === "cottage" || recipe === "branch_house" ? awtsmoos3DRecipe(recipe, command.id, command) : proceduralCorePacket("building", command.id, command); }
