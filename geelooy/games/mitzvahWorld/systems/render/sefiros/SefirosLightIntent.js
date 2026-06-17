// B"H
import { renderPacket } from "./SefirosRenderPacket.js";
export function sefirosLightIntent(id, light = {}) { return renderPacket("light_intent", { id, light }); }
