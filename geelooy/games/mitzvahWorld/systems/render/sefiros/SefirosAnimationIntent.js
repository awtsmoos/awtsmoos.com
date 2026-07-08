// B"H
import { renderPacket } from "./SefirosRenderPacket.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
export function sefirosAnimationIntent(id, animation = {}) { return renderPacket("animation_intent", { id, animation }); }
