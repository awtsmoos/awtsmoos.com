// B"H
import { renderPacket } from "./SefirosRenderPacket.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
import { proceduralRenderMeshPacket } from "../ProceduralMeshBridge.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
export function sefirosProceduralIntent(id, spec = {}) { return renderPacket("procedural_intent", { id, mesh:proceduralRenderMeshPacket(spec) }); }
