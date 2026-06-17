// B"H
import { renderPacket } from "./SefirosRenderPacket.js";
import { proceduralRenderMeshPacket } from "../ProceduralMeshBridge.js";
export function sefirosProceduralIntent(id, spec = {}) { return renderPacket("procedural_intent", { id, mesh:proceduralRenderMeshPacket(spec) }); }
