// B"H
/** @file TerumahMaaserRuntime.js @description Educational tevel-to-separated produce flow with halacha profession XP and mission progress. */
import { ensureMaaserYear } from "./MaaserYearCycleRuntime.js";
import { nextSeparationStep, separationComplete } from "./SeparationOrderRuntime.js";
import { isTevel, markSeparated } from "./ProduceStatusRuntime.js";
import { progressActiveObjectives } from "../missions/MissionObjectiveRuntime.js";
import { grantProfessionXp } from "../professions/ProfessionRuntime.js";
function playerOf(olam) { return olam?.player || olam?.chossid || null; }
export function ensureSeparationState(player) { player.separationState ||= { activeItemId:null, steps:[] }; return player.separationState; }
export function beginSeparation(olam, itemId = null) { const p = playerOf(olam); if (!p) return false; const item = (p.inventory?.slots || []).find(i => i && (!itemId || i.id === itemId) && isTevel(i)); if (!item) return false; const state = ensureSeparationState(p); state.activeItemId = item.id; state.steps = item.produceStatus.steps || []; emit(olam, state, item); return { state, item }; }
export function doSeparationStep(olam) { const p = playerOf(olam), year = ensureMaaserYear(olam); if (!p) return false; const state = ensureSeparationState(p); const item = (p.inventory?.slots || []).find(i => i?.id === state.activeItemId); if (!item || !isTevel(item)) return false; const step = nextSeparationStep(state.steps, year); if (!step) return finishSeparation(olam); state.steps.push(step); item.produceStatus.steps = [...state.steps]; grantProfessionXp(olam, "halacha", 5); progressActiveObjectives(olam, step, 1); progressActiveObjectives(olam, "separate", 1); olam?.ayshPeula?.("ui event", "halachaNotice", { text:`Separated: ${step}` }); if (separationComplete(state.steps, year)) return finishSeparation(olam); emit(olam, state, item); return { step, state, item }; }
export function finishSeparation(olam) { const p = playerOf(olam); if (!p) return false; const state = ensureSeparationState(p); const item = (p.inventory?.slots || []).find(i => i?.id === state.activeItemId); markSeparated(item, state.steps); grantProfessionXp(olam, "halacha", 12); progressActiveObjectives(olam, "separatedProduce", 1); olam?.ayshPeula?.("ui event", "effectsOverlay", { text:"Produce separated", color:"#d7c8ff" }); emit(olam, state, item); return item; }
function emit(olam, state, item) { const payload = { open:true, activeItemId:state.activeItemId, steps:state.steps, item, disclaimer:"Educational gameplay, not practical halacha." }; olam?.ayshPeula?.("ui event", "separationPanel", payload); return payload; }
export default { beginSeparation, doSeparationStep, finishSeparation, ensureSeparationState };
