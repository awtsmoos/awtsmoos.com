// B"H
/**
 * @file LivingWorldFrameStep.js
 * @description
 * Full village life is rich, but rendered frames must be tiny. Budgeted frame
 * pulses reuse the latest village activity summary; full pulses advance the
 * scheduler and may update memories, UI payloads, services, and economy.
 */

export function villageFrameEcho(store = {}, hour = 6, reason = "frame") {
  const current = store.villageActivity || {};
  return {
    phase: current.phase || null,
    hour,
    mood: current.mood || "quiet",
    lighting: current.lighting || null,
    sound: current.sound || null,
    crowd: current.crowd || "low",
    services: current.services || [],
    assignments: [],
    changed: false,
    reason,
    frameEcho: true,
    saved: false
  };
}

export function advanceVillageForPolicy(store, scheduler, hour, reason, policy) {
  if (policy?.budgeted) return villageFrameEcho(store, hour, reason);
  return scheduler.advanceTo(hour, reason, { persist: false, emit: policy?.emit });
}

export function budgetedLivingWorldFrame(store, runtimeState, reason = "frame", hour = 6) {
  const frame = runtimeState.__budgetedFramePayload ||= {
    reason: "frame",
    village: villageFrameEcho(store, hour, "frame"),
    directedEvent: null,
    schedule: [],
    event: null,
    crafted: null,
    rumors: [],
    missionsBeforeCraft: null,
    missions: [],
    prices: {},
    uiPayloads: {},
    reputation: {},
    budgeted: true,
    frameOnly: true
  };
  const village = frame.village;
  village.phase = store.villageActivity?.phase || null;
  village.hour = hour;
  village.mood = store.villageActivity?.mood || "quiet";
  village.lighting = store.villageActivity?.lighting || null;
  village.sound = store.villageActivity?.sound || null;
  village.crowd = store.villageActivity?.crowd || "low";
  village.reason = reason;
  runtimeState.ticks += 1;
  runtimeState.dirty = true;
  runtimeState.skippedSaves += 1;
  frame.reason = reason;
  frame.rumors = store.rumors || frame.rumors;
  frame.prices = store.economy?.prices || frame.prices;
  frame.uiPayloads = store.uiPayloads || frame.uiPayloads;
  frame.reputation = store.reputation || frame.reputation;
  runtimeState.lastStep = frame;
  return frame;
}

export default {
  villageFrameEcho,
  advanceVillageForPolicy,
  budgetedLivingWorldFrame
};
