// B"H
import { cinematicPacket } from "./CinematicPacket.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
export function lightingPacket(id, at = 0, duration = 0, { style="warm", lensFlare=false, sunPulse=false, fogShift=null, godRay=false } = {}) { return cinematicPacket("lighting", id, at, duration, { style, lensFlare, sunPulse, fogShift, godRay }); }
export default lightingPacket;
