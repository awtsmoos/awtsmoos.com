// B"H

import { $ } from "../../ui/dom.js";
import { agentId } from "./state.js";
import { normalizeRoomEvent } from "./events.js";

/** B"H: Human voice enters one selected room and immediately becomes an event. */
export function messagePayload(missionId, body, forceContinue, blockAgents) {
  const clean = String(body || "").trim();
  return {
    action: "missionRoomUserMessage",
    targetVessel: "native-tunnel",
    missionId,
    agentId: agentId(),
    body: forceContinue ? `${clean}\ncontinue`.trim() : clean,
    requiresResponse: !forceContinue && blockAgents,
    allowContinue: !!forceContinue
  };
}

export function optimisticMessageEvent(state, body, forceContinue = false) {
  return normalizeRoomEvent({
    missionId: state.selectedMissionId,
    actor: "human",
    target: "room",
    type: forceContinue ? "continue-message" : "user-message",
    title: body || "continue",
    body,
    at: new Date().toISOString(),
    status: "sending"
  }, { roomId: state.selectedMissionId });
}

export async function send(state, api, forceContinue = false) {
  if (!state.selectedMissionId) throw new Error("open_a_room_first");
  const body = $("roomMessage")?.value || "";
  const block = $("roomBlockAgents")?.checked !== false;
  const got = await api(messagePayload(state.selectedMissionId, body, forceContinue, block));
  if ($("roomMessage")) $("roomMessage").value = "";
  state.selected = got;
  state.lastResult = got;
  return got;
}

export function roomLink(state) {
  const url = new URL(location.href);
  url.searchParams.set("room", state.selectedMissionId || "");
  return url.toString();
}

export async function copyRoomLink(state) {
  const link = roomLink(state);
  await navigator.clipboard?.writeText?.(link);
  return link;
}
