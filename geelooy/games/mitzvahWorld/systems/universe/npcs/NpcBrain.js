// B"H
import { currentNpcAction } from "./NpcScheduleRuntime.js?compact=true&v=compact-all-visible-npc-never-cull-20260708-bh11";
export function npcBrain(npc = {}, worldState = {}) { const action = currentNpcAction(npc, worldState.time || "day"); return { npcId:npc.id, action, wantsDialogue:Boolean(npc.dialogue), emotionalTone:action === "guide_player" ? "helpful" : "working" }; }
export function npcBrains(npcs = [], worldState = {}) { return npcs.map(n => npcBrain(n, worldState)); }
