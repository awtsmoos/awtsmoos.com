// B"H
/** @file WorldEventRuntime.js @description Starts/completes dynamic starting-zone events and progresses event objectives. */
import StartingZoneEventRegistry from "./StartingZoneEventRegistry.js";
import { announceEvent } from "./EventAnnouncementRuntime.js";
import { progressActiveObjectives } from "../missions/MissionObjectiveRuntime.js";
export function ensureWorldEvents(olam) { olam.__worldEvents ||= { active:{}, completed:{} }; return olam.__worldEvents; }
export function startWorldEvent(olam, id) {
  const e = StartingZoneEventRegistry.find(x => x.id === id); if (!e) return false;
  const s = ensureWorldEvents(olam); s.active[id] = { ...e, startedAt:Date.now() }; announceEvent(olam, e);
  progressActiveObjectives(olam, "startEvent", 1); progressActiveObjectives(olam, `startEvent:${id}`, 1); return s.active[id];
}
export function completeWorldEvent(olam, id) {
  const s = ensureWorldEvents(olam); if (!s.active[id]) return false;
  s.completed[id] = Date.now(); delete s.active[id];
  progressActiveObjectives(olam, "surviveEvent", 1); progressActiveObjectives(olam, `surviveEvent:${id}`, 1);
  olam?.ayshPeula?.("ui event", "effectsOverlay", { text:"EVENT COMPLETE", color:"#76ff8a" }); return true;
}
export default { ensureWorldEvents, startWorldEvent, completeWorldEvent };
