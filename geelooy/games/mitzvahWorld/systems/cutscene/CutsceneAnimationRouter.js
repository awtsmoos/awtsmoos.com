// B"H
import { animationPacket } from "./packets/AnimationPacket.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
export function routeAnimationBeat(beat = {}) { const p = beat.payload || beat; return animationPacket(beat.id || p.id, beat.at || p.at || 0, p.duration || beat.duration || 1, { actor:p.actor || p.target || p.speaker, action:p.intent || p.action || "talk", blend:p.blend ?? .25 }); }
export default routeAnimationBeat;
