// B"H
import { renderPacket } from "./SefirosRenderPacket.js";
export function sefirosMeshIntent(id, form = {}) { return renderPacket("mesh_intent", { id, form }); }
