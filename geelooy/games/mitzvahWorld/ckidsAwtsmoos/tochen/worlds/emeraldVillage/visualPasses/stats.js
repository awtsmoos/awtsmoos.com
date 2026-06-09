// B"H
/** @file stats.js @description Chapter 182: Every NPC carries a neighborhood soul. */
export const STAT_SETS=Object.freeze([{wisdom:22,kindness:18,courage:12,trade:8,growth:16,light:20},{wisdom:12,kindness:16,courage:18,trade:24,growth:10,light:13},{wisdom:14,kindness:23,courage:11,trade:9,growth:25,light:18},{wisdom:26,kindness:13,courage:19,trade:7,growth:12,light:24}]);
export function enrichNpc(npc,index){return{...npc,areaName:npc.areaName||'Emerald Entry Village',areaStats:npc.areaStats||STAT_SETS[index%STAT_SETS.length],areaNote:npc.areaNote||'These stats belong to the NPC and neighborhood you are standing in.'}}
