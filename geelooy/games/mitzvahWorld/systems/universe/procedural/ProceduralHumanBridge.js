// B"H
import { awtsmoos3DRecipe } from "./Awtsmoos3DBridge.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
export function proceduralHuman(command = {}) { return awtsmoos3DRecipe("rigged_human", command.id, { ...command, name:command.name, role:command.role }); }
