// B"H
import { hodSignal } from "../../sefiros/HodSignal.js";
export function compileShotToSefirah(shot = {}) { return hodSignal(shot.id || "shot", { shot }); }
