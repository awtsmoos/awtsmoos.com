// B"H

import { $ } from "../../ui/dom.js";
import { agentId, projectRoot } from "./state.js";
import { renderRoom, renderOut, setStatus } from "./render.js";

/** B"H — Chapter 708: Messages left the engine room. */
export async function send(state, api, forceContinue) {
  if (!state.selectedMissionId) return setStatus("Select a room first.");
  const body = messageBody(forceContinue);
  if (!body.trim()) return setStatus("Write a message first.");
  const got = await api(payload(state, body, forceContinue));
  if ($("roomMessage")) $("roomMessage").value = "";
  state.selected = got;
  state.lastResult = got;
  setStatus(forceContinue ? "Continue message sent." : "User message sent to room.");
  renderRoom(state);
  renderOut(got);
}

function payload(state, body, forceContinue) {
  return {
    action: "missionRoomUserMessage",
    targetVessel: "native-tunnel",
    missionId: state.selectedMissionId,
    agentId: agentId(),
    body,
    requiresResponse: !forceContinue && $("roomBlockAgents")?.checked !== false,
    allowContinue: forceContinue
  };
}

function messageBody(forceContinue) {
  const text = $("roomMessage")?.value || "";
  return forceContinue ? `${text}\ncontinue`.trim() : text;
}

export function copyRoomLink(state) {
  if (!state.selectedMissionId) return setStatus("Select a room first.");
  const url = new URL(location.href);
  url.searchParams.set("room", state.selectedMissionId);
  if (projectRoot()) url.searchParams.set("projectRoot", projectRoot());
  navigator.clipboard?.writeText(url.toString()).catch(() => {});
  setStatus(url.toString());
}
