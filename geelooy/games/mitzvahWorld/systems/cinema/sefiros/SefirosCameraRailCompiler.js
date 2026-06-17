// B"H
import { netzachMotion } from "../../sefiros/NetzachMotion.js";
export function compileRailToSefirah(rail = {}) { return netzachMotion(rail.railId || rail.id || "rail", { rail }); }
