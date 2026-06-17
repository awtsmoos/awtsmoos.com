// B"H
import { netzachMotion } from "../../sefiros/NetzachMotion.js";
export function compileMotionToSefirah(command = {}) { return netzachMotion(command.target || "character", { command }); }
