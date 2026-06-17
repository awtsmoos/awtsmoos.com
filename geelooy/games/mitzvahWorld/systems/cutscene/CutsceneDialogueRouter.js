// B"H
import { dialoguePacket } from "./packets/DialoguePacket.js";
export function routeDialogueBeat(beat = {}) { const p = beat.payload || beat; return dialoguePacket(beat.id || p.id, beat.at || p.at || 0, p.duration || beat.duration || 3, { speaker:p.speaker || "narrator", text:p.text || p.subtitle || "", subtitle:p.subtitle || p.text || "" }); }
export default routeDialogueBeat;
