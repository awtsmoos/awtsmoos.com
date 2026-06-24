// B"H

import { agentId, pollMs } from "./state.js";
import { heartbeatPayload } from "./api.js";

/**
 * B"H
 * Chapter 707: The wheel learned to sleep.
 */
export function schedule(state, api, refresh) {
  clearTimeout(state.timer);
  if (!state.selectedMissionId || document.hidden) return;
  state.timer = setTimeout(() => refresh(state, api, true), pollMs());
}

export async function heartbeat(state, api) {
  if (Date.now() - state.lastHeartbeatAt < 3000) return;
  state.lastHeartbeatAt = Date.now();
  await api(heartbeatPayload(state.selectedMissionId, agentId()));
}
