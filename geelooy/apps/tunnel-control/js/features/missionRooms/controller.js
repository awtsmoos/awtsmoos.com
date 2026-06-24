// B"H

import { $ } from "../../ui/dom.js";
import { roomAction, discoverPayload } from "./api.js";
import { createRoomState, loadSelection, saveSelection, paramsSelection, agentId, projectRoot } from "./state.js";
import { renderAll, renderList, renderRoom, renderOut, setStatus } from "./render.js";
import { schedule, heartbeat } from "./loop.js";
import { send, copyRoomLink } from "./messages.js";

/**
 * B"H
 * Chapter 705: The polling wheel became a heartbeat covenant.
 */
export function createRoomController(getTunnelName) {
  const state = createRoomState();
  const api = payload => roomAction(getTunnelName, payload);
  return { mount: () => mount(state, api), join: id => join(state, api, id) };
}

function mount(state, api) {
  if (!$("discoverRoomsBtn")) return;
  bind(state, api);
  hydrateInputs(state);
  discover(state, api, "boot").then(() => rejoin(state, api)).catch(errorStatus).finally(() => schedule(state, api, refresh));
}

function bind(state, api) {
  $("discoverRoomsBtn").onclick = () => discover(state, api, "manual");
  $("refreshRoomBtn").onclick = () => refresh(state, api);
  $("sendRoomMessageBtn").onclick = () => send(state, api, false);
  $("allowRoomContinueBtn").onclick = () => send(state, api, true);
  $("copyRoomLinkBtn").onclick = () => copyRoomLink(state);
  window.addEventListener?.("visibilitychange", () => schedule(state, api, refresh));
}

function hydrateInputs(state) {
  const saved = loadSelection();
  const params = paramsSelection();
  state.selectedMissionId = params.missionId || saved.missionId || "";
  if ($("roomProjectRoot")) $("roomProjectRoot").value = params.projectRoot || saved.projectRoot || "";
  if ($("roomAgentId")) $("roomAgentId").value = params.agentId || saved.agentId || agentId();
}

async function discover(state, api, reason = "refresh") {
  const got = await api(discoverPayload(projectRoot(), agentId()));
  state.lastResult = got;
  state.missions = got.missions || [];
  if (!state.selectedMissionId && state.missions[0]) state.selectedMissionId = state.missions[0].mission.id;
  setStatus(`Discovered ${state.missions.length} rooms (${reason}).`);
  renderList(state, { join: id => join(state, api, id) });
  renderOut(got);
}

async function rejoin(state, api) {
  if (state.selectedMissionId) await join(state, api, state.selectedMissionId, true);
}

async function join(state, api, missionId, quiet = false) {
  state.selectedMissionId = missionId;
  const got = await api({ action: "missionProjectJoin", targetVessel: "native-tunnel", missionId, agentId: agentId(), role: "human-room", capabilities: "comment,steer,approve,block", projectRoot: projectRoot() });
  state.selected = got;
  state.lastResult = got;
  saveSelection({ missionId, projectRoot: projectRoot(), agentId: agentId() });
  if (!quiet) setStatus(`Joined room ${missionId}.`);
  renderAll(state, { join: id => join(state, api, id) });
}

async function refresh(state, api, quiet = false) {
  if (!state.selectedMissionId || state.busy) return;
  state.busy = true;
  try {
    await heartbeat(state, api);
    const got = await api({ action: "missionProjectStatus", targetVessel: "native-tunnel", missionId: state.selectedMissionId });
    state.selected = got;
    state.lastResult = got;
    if (!quiet) setStatus(`Room loaded: ${state.selectedMissionId}`);
    renderRoom(state);
    renderOut(got);
  } catch (err) {
    errorStatus(err);
  } finally {
    state.busy = false;
    schedule(state, api, refresh);
  }
}

function errorStatus(error) {
  setStatus(error?.message || String(error));
}
