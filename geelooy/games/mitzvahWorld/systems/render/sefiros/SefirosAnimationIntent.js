// B"H
import { renderPacket } from "./SefirosRenderPacket.js";
export function sefirosAnimationIntent(id, animation = {}) { return renderPacket("animation_intent", { id, animation }); }
