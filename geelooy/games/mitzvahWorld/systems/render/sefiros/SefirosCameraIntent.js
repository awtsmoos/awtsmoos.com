// B"H
import { renderPacket } from "./SefirosRenderPacket.js";
export function sefirosCameraIntent(id, camera = {}) { return renderPacket("camera_intent", { id, camera }); }
