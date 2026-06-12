// B"H
/** @file RegionPhases.js @description Ordered gates for the full region birth. */
export const REGION_PHASES = Object.freeze(['terrain','ecology','biomes','roads','vegetation','houses','wildlife','npcSchedules','colliders','debug']);
export function phaseReport(name,value){return {name,ok:true,value,at:Date.now()};}
