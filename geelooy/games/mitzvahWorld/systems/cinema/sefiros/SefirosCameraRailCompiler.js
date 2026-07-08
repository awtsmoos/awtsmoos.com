// B"H
import { netzachMotion } from "../../sefiros/NetzachMotion.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
export function compileRailToSefirah(rail = {}) { return netzachMotion(rail.railId || rail.id || "rail", { rail }); }
