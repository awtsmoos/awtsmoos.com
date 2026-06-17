// B"H
import { sefirahPacket } from "./SefirahPacket.js";
export function kesserIntent(title, payload = {}) { return sefirahPacket("kesser", "intent", { title, ...payload }); }
