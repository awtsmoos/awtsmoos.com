// B"H
import { sefirahPacket } from "./SefirahPacket.js";
export function yesodConnection(from, to, data = {}) { return sefirahPacket("yesod", "connection", { from, to, data }); }
