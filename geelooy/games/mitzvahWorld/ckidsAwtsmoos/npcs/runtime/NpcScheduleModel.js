// B"H
/** @file NpcScheduleModel.js @description NPCs live by day rhythms, not idle statues. */
export function npcSchedule(role = "villager") { return [{ at:"06:30", action:"wake", place:"home" }, { at:"08:00", action:role === "teacher" ? "teach" : "work", place:role === "teacher" ? "study-hall" : "village" }, { at:"13:00", action:"eat", place:"home" }, { at:"16:00", action:"walk", place:"market" }, { at:"19:00", action:"pray", place:"synagogue" }, { at:"22:00", action:"sleep", place:"home" }]; }
export default npcSchedule;
