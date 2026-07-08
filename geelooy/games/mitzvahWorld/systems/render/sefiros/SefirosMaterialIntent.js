// B"H
import { renderPacket } from "./SefirosRenderPacket.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
export function sefirosMaterialIntent(id, material = {}) { return renderPacket("material_intent", { id, material }); }
