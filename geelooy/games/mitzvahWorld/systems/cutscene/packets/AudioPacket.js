// B"H
import { cinematicPacket } from "./CinematicPacket.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
export function audioPacket(id, at = 0, duration = 0, { audioKind="ambience", asset=null, volume=1, fade=0 } = {}) { return cinematicPacket("audio", id, at, duration, { audioKind, asset, volume, fade }); }
export default audioPacket;
