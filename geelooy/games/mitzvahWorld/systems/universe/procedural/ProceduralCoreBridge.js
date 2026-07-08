// B"H
import { createProceduralMeshPacket } from "../../procedural/api/ProceduralMeshApi.js?compact=true&v=compact-final-npc-props-20260708-bh12";
export function proceduralCorePacket(kind, id, config = {}) { return createProceduralMeshPacket({ ...config, id, primitive:config.primitive || kind, recipe:config.recipe || kind }); }
export function modifierToCore(modifier = {}) { return { type:modifier.type, params:{ ...modifier } }; }
