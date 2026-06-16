// B"H
/** @file MaaserYearCycleRuntime.js @description Simplified educational year-cycle selector. */
export function ensureMaaserYear(olam) { olam.__maaserYear ||= 3; return olam.__maaserYear; }
export function setMaaserYear(olam, year) { olam.__maaserYear = Math.max(1, Math.min(6, Number(year) || 3)); return olam.__maaserYear; }
export function finalMaaserForYear(year = 3) { return [3, 6].includes(Number(year)) ? "maaserAni" : "maaserSheni"; }
export default { ensureMaaserYear, setMaaserYear, finalMaaserForYear };
