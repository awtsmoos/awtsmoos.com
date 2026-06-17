// B"H
import { hodSignal } from "../../sefiros/HodSignal.js";
export function compileDialogueToSefirah(beat = {}) { return hodSignal(`dialogue:${beat.beat || beat.speaker || "beat"}`, { beat }); }
