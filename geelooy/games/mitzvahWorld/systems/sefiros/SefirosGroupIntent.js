// B"H
import { sefirahPacket } from "./SefirahPacket.js";
export function sefirosGroupIntent(id, group = "ungrouped") { return sefirahPacket("yesod", "group", { id, group }); }
