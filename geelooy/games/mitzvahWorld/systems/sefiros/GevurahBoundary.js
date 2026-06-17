// B"H
import { sefirahPacket } from "./SefirahPacket.js";
export function gevurahBoundary(id, limits = {}) { return sefirahPacket("gevurah", "boundary", { id, limits }); }
