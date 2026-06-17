// B"H
import { awtsmoos3DRecipe } from "./Awtsmoos3DBridge.js";
export function proceduralHuman(command = {}) { return awtsmoos3DRecipe("rigged_human", command.id, { ...command, name:command.name, role:command.role }); }
