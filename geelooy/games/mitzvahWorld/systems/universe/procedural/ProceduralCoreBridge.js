// B"H
import { createProceduralMeshPacket } from "../../procedural/api/ProceduralMeshApi.js";
export function proceduralCorePacket(kind, id, config = {}) { return createProceduralMeshPacket({ ...config, id, primitive:config.primitive || kind, recipe:config.recipe || kind }); }
export function modifierToCore(modifier = {}) { return { type:modifier.type, params:{ ...modifier } }; }
