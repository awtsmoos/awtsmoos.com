// B"H
import { cinematicPacket } from "./CinematicPacket.js";
export function dialoguePacket(id, at = 0, duration = 3, { speaker="narrator", text="", subtitle=text, voiceId=null, choiceLock=true } = {}) { return cinematicPacket("dialogue", id, at, duration, { speaker, text, subtitle, voiceId, choiceLock }); }
export default dialoguePacket;
