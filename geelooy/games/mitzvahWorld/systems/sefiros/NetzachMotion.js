// B"H
import { sefirahPacket } from "./SefirahPacket.js";
export function netzachMotion(id, motion = {}) { return sefirahPacket("netzach", "motion", { id, motion }); }
