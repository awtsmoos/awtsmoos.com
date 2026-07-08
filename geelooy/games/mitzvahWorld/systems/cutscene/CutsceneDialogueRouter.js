// B"H
import { dialoguePacket } from "./packets/DialoguePacket.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
export function routeDialogueBeat(beat = {}) { const p = beat.payload || beat; return dialoguePacket(beat.id || p.id, beat.at || p.at || 0, p.duration || beat.duration || 3, { speaker:p.speaker || "narrator", text:p.text || p.subtitle || "", subtitle:p.subtitle || p.text || "" }); }
export default routeDialogueBeat;
