// B"H
import { awtsmoos3DRecipe } from "./Awtsmoos3DBridge.js";
export function proceduralPath(command = {}) { return awtsmoos3DRecipe("path", command.id, command); }
