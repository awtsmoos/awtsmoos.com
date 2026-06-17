// B"H
export function npcSchedule(npc = {}) { return npc.schedule || [{ time:"dawn", action:"arrive" }, { time:"day", action:npc.role === "guide" ? "guide_player" : "work" }, { time:"night", action:"rest" }]; }
export function currentNpcAction(npc = {}, time = "day") { return npcSchedule(npc).find(s => s.time === time)?.action || "idle"; }
