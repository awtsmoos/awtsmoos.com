// B"H
import { cinematicPacket } from "./CinematicPacket.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
export function animationPacket(id, at = 0, duration = 1, { actor=null, action="idle", blend=.25 } = {}) { return cinematicPacket("animation", id, at, duration, { actor, action, blend }); }
export default animationPacket;
