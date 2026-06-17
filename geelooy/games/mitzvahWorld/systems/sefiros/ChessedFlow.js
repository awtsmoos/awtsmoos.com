// B"H
import { sefirahPacket } from "./SefirahPacket.js";
export function chessedFlow(id, generosity = {}) { return sefirahPacket("chessed", "flow", { id, generosity }); }
