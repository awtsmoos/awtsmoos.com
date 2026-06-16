// B"H
/**
 * @file MissionEventBus.js
 * @description Mission pulses that can cross NPC, combat, bag, and HUD code.
 */
export function ensureMissionBus(olam) {
  olam.__missionEvents ||= [];
  return olam.__missionEvents;
}
export function publishMissionEvent(olam, type, payload = {}) {
  const event = { type, payload, at: Date.now() };
  ensureMissionBus(olam).push(event);
  olam.__missionEvents = olam.__missionEvents.slice(-120);
  olam?.ayshPeula?.("ui event", "missionEvent", event);
  return event;
}
export function recentMissionEvents(olam, type = null) {
  const all = ensureMissionBus(olam);
  return type ? all.filter(e => e.type === type) : all;
}
export default { ensureMissionBus, publishMissionEvent, recentMissionEvents };
