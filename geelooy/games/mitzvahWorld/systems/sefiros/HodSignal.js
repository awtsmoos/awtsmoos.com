// B"H
import { sefirahPacket } from "./SefirahPacket.js";
export function hodSignal(id, signal = {}) { return sefirahPacket("hod", "signal", { id, signal }); }
