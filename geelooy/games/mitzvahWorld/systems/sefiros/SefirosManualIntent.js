// B"H
import { sefirahPacket } from "./SefirahPacket.js";
export function sefirosManualIntent(id, manual = {}) { return sefirahPacket("malchus", "manual_control", { id, manual }); }
