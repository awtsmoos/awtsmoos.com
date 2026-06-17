// B"H
import { sefirahPacket } from "./SefirahPacket.js";
export function sefirosModifierIntent(id, modifiers = []) { return sefirahPacket("binah", "modifier_stack", { id, modifiers }); }
