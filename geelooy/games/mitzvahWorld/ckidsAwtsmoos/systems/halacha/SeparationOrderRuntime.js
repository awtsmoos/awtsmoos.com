// B"H
/** @file SeparationOrderRuntime.js @description Educational separation order for produce. */
import { finalMaaserForYear } from "./MaaserYearCycleRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
export function separationSteps(year = 3) { return ["terumahGedolah", "maaserRishon", "terumatMaaser", finalMaaserForYear(year)]; }
export function nextSeparationStep(done = [], year = 3) { return separationSteps(year).find(s => !done.includes(s)) || null; }
export function separationComplete(done = [], year = 3) { return separationSteps(year).every(s => done.includes(s)); }
export default { separationSteps, nextSeparationStep, separationComplete };
