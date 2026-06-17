// B"H
import { lightingPacket } from "./packets/LightingPacket.js";
export function routeLightingBeat(beat = {}) { const p = beat.payload || beat; return lightingPacket(beat.id || p.id, beat.at || p.at || 0, p.duration || beat.duration || 0, { style:p.style || "warm", lensFlare:Boolean(p.lensFlare), sunPulse:Boolean(p.sunPulse), fogShift:p.fogShift || null, godRay:Boolean(p.godRay) }); }
export default routeLightingBeat;
