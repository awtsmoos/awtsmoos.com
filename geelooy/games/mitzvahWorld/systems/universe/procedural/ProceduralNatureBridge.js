// B"H
import { awtsmoos3DRecipe } from "./Awtsmoos3DBridge.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { proceduralCorePacket } from "./ProceduralCoreBridge.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
export function proceduralNature(command = {}) { const recipe = command.procedural?.recipe || command.kind || command.type || "nature"; return ["tree","grass","sky","mountain","fence"].includes(recipe) ? awtsmoos3DRecipe(recipe, command.id, command) : proceduralCorePacket(recipe, command.id, command); }
