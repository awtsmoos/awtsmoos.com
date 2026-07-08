// B"H
import { hodSignal } from "../../sefiros/HodSignal.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
export function compileShotToSefirah(shot = {}) { return hodSignal(shot.id || "shot", { shot }); }
