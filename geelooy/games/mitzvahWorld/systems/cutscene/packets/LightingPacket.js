// B"H
import { cinematicPacket } from "./CinematicPacket.js";
export function lightingPacket(id, at = 0, duration = 0, { style="warm", lensFlare=false, sunPulse=false, fogShift=null, godRay=false } = {}) { return cinematicPacket("lighting", id, at, duration, { style, lensFlare, sunPulse, fogShift, godRay }); }
export default lightingPacket;
