// B"H
/** @file QuestDiagnostics.js @description Quest proof aggregation. */
import { collectQuestMarkerCounts } from "./QuestMarkers.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

export function collectQuestDiagnostics(olam) {
  const state = olam?.__kidQuestState || {};
  const markers = collectQuestMarkerCounts(olam);
  return {
    ...markers,
    acceptedQuest:Object.keys(state.accepted || {})[0] || null,
    progressUpdated:Object.keys(state.items || {}).length > 0,
    turnInReady:Object.keys(state.completed || {}).length > 0,
    turnInCompleted:Object.keys(state.turnedIn || {}).length > 0,
    rewardGranted:(state.events || []).some(e => e.type === "turn-in" && e.reward),
    events:(state.events || []).slice(-8)
  };
}

export default { collectQuestDiagnostics };
