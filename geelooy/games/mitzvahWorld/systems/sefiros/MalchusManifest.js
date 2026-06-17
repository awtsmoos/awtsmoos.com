// B"H
import { sefirahPacket } from "./SefirahPacket.js";
export function malchusManifest(id, manifest = {}) { return sefirahPacket("malchus", "manifest", { id, manifest }); }
