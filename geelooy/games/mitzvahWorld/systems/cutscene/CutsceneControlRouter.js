// B"H
import { controlPacket } from "./packets/ControlPacket.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
export function routeControlBeat(beat = {}) { const p = beat.payload || beat; return controlPacket(p.action || beat.action || "lock_player_control", beat.at || p.at || 0, beat.id || p.id); }
export default routeControlBeat;
