// B"H
import { awtsmoos3DRecipe } from "./Awtsmoos3DBridge.js";
import { proceduralCorePacket } from "./ProceduralCoreBridge.js";
export function proceduralNature(command = {}) { const recipe = command.procedural?.recipe || command.kind || command.type || "nature"; return ["tree","grass","sky","mountain","fence"].includes(recipe) ? awtsmoos3DRecipe(recipe, command.id, command) : proceduralCorePacket(recipe, command.id, command); }
