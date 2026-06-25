// B"H

import { $ } from "../../ui/dom.js";
import { agentId } from "./state.js";

/** B"H: Human voice enters only the selected mission room. */
export function messagePayload(missionId, body, forceContinue, blockAgents) {
  return { action: "missionRoomUserMessage", targetVessel: "native-tunnel", missionId, agentId: agentId(), body: forceContinue ? `${body}\ncontinue`.trim() : body, requiresResponse: !forceContinue && blockAgents, allowContinue: forceContinue };
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
