// B"H

import { agentId, pollMs } from "./state.js";
import { heartbeatPayload } from "./api.js";

/**
 * B"H
 * Chapter 905: The clock swore loyalty to one room.
 *
 * There is no lobby polling storm. The interval begins only after selection,
 * refreshes only the selected room, and is destroyed when Back returns the
 * human to the lobby.
 *
 * @param {object} state Room state.
 * @param {Function} refresh Selected-room refresh function.
 */
export function startRoomPolling(state, refresh) {
  stopRoomPolling(state);
  if (!state.selectedMissionId) return;
  state.pollTimer = setInterval(() => refresh(true), pollMs());
}

/** @param {object} state Room state. */
export function stopRoomPolling(state) {
  clearInterval(state.pollTimer);
  state.pollTimer = 0;
}

/** @param {object} state Room state. @param {Function} api API bridge. */
export async function heartbeat(state, api) {
  if (!state.selectedMissionId || Date.now() - state.lastHeartbeatAt < 3000) return;
  state.lastHeartbeatAt = Date.now();
  await api(heartbeatPayload(state.selectedMissionId, agentId()));
}
