// B"H
import { audioPacket } from "./packets/AudioPacket.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
export function routeAudioBeat(beat = {}) { const p = beat.payload || beat; return audioPacket(beat.id || p.id, beat.at || p.at || 0, p.duration || beat.duration || 0, { audioKind:p.audioKind || "ambience", asset:p.asset || p.id, volume:p.volume ?? 1, fade:p.fade || 0 }); }
export default routeAudioBeat;
