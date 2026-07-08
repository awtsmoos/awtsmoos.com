// B"H
import { createProceduralMeshPacket } from "../../procedural/api/ProceduralMeshApi.js?compact=true&v=compact-final-npc-props-20260708-bh12";
export const AWTSMOOS3D_RECIPES = Object.freeze({ cottage:"cottage", grass:"grass", path:"path", tree:"tree", sky:"sky", branch_house:"branch_house", mountain:"mountain", fence:"fence", rigged_human:"rigged_human" });
export function awtsmoos3DRecipe(kind, id, params = {}) { return createProceduralMeshPacket({ ...params, id, primitive:kind, recipe:AWTSMOOS3D_RECIPES[kind] || kind }); }
