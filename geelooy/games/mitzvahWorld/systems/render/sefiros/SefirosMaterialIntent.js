// B"H
import { renderPacket } from "./SefirosRenderPacket.js";
export function sefirosMaterialIntent(id, material = {}) { return renderPacket("material_intent", { id, material }); }
