// B"H

import { $ } from "../../ui/dom.js";
import { roomAction, discoverPayload, liveCalls, joinPayload, statusPayload } from "./api.js";
import { createRoomState, loadSelection, saveSelection, paramsSelection, agentId, projectRoot, pollMs } from "./state.js";
import { renderAll, renderList, renderRoom, renderOut, renderCommands, setStatus } from "./render.js";
import { heartbeat } from "./loop.js";
import { send, copyRoomLink } from "./messages.js";
import { commandRowsFrom } from "./commands.js";

/** B"H: rooms first; selected-room tunnel calls second. */
export function createRoomController(getTunnelName) {
  const state = createRoomState();
  const api = payload => roomAction(getTunnelName, payload);
  return { mount: () => mount(state, api), join: id => join(state, api, id) };
}

function mount(state, api) {
  if (!$("discoverRoomsBtn")) return;
  bind(state, api);
  hydrateInputs(state);
  discover(state, api, "boot").then(() => rejoin(state, api)).catch(errorStatus);
  refreshCalls(state).catch(() => {});
  schedule(state, api);
}

function bind(state, api) {
  $("discoverRoomsBtn").onclick = () => discover(state, api, "manual");
  $("refreshRoomBtn").onclick = () => refresh(state, api);
  $("sendRoomMessageBtn").onclick = () => send(state, api, false);
  $("allowRoomContinueBtn").onclick = () => send(state, api, true);
  $("copyRoomLinkBtn").onclick = () => copyRoomLink(state);
  $("roomProjectRoot")?.addEventListener("change", () => discover(state, api, "filter"));
  document.addEventListener("visibilitychange", () => { if (!document.hidden) wake(state, api); });
}

function hydrateInputs(state) {
  const saved = loadSelection(), params = paramsSelection();
  state.selectedMissionId = params.missionId || saved.missionId || "";
  if ($("roomProjectRoot")) $("roomProjectRoot").value = params.projectRoot || saved.projectRoot || "";
  if ($("roomAgentId")) $("roomAgentId").value = params.agentId || saved.agentId || agentId();
}

async function wake(state, api) {
  await discover(state, api, "visible");
  await refresh(state, api, true);
}

async function discover(state, api, reason = "refresh") {
  const got = await api(discoverPayload(projectRoot(), agentId()));
  state.lastResult = got;
  state.missions = got.missions || [];
  preserveSelection(state);
  setStatus(`Showing ${state.missions.length} available rooms (${reason}).`);
  renderList(state, { join: id => join(state, api, id) });
  renderOut(got);
}

function preserveSelection(state) {
  if (!state.missions.some(row => row.mission?.id === state.selectedMissionId)) state.selectedMissionId = state.missions[0]?.mission?.id || "";
}

async function rejoin(state, api) { if (state.selectedMissionId) await join(state, api, state.selectedMissionId, true); }

async function join(state, api, missionId, quiet = false) {
  state.selectedMissionId = missionId;
  state.selected = await api({ ...joinPayload(missionId), agentId: agentId(), role: "human-room", capabilities: "comment,steer,approve,block", projectRoot: projectRoot() });
  state.lastResult = state.selected;
  saveSelection({ missionId, projectRoot: projectRoot(), agentId: agentId() });
  await refreshCalls(state).catch(() => {});
  if (!quiet) setStatus(`Opened room ${missionId}.`);
  renderAll(state, { join: id => join(state, api, id) });
}

async function refresh(state, api, quiet = false) {
  if (!state.selectedMissionId || state.busy) return;
  state.busy = true;
  try {
    await heartbeat(state, api);
    state.selected = await api(statusPayload(state.selectedMissionId));
    state.lastResult = state.selected;
    await refreshCalls(state).catch(() => {});
    if (!quiet) setStatus(`Room refreshed: ${state.selectedMissionId}`);
    renderRoom(state); renderCommands(state); renderOut(state.selected);
  } catch (err) { errorStatus(err); }
  finally { state.busy = false; }
}

async function refreshCalls(state) {
  const live = await liveCalls(state.selectedMissionId || projectRoot());
  state.liveGroups = live.groups || [];
  state.commandRows = commandRowsFrom(state, live);
  renderCommands(state);
}

function schedule(state, api) {
  clearInterval(state.discoverTimer); clearInterval(state.timer); clearInterval(state.callsTimer);
  state.discoverTimer = setInterval(() => discover(state, api, "auto").catch(errorStatus), Math.max(4500, pollMs() * 3));
  state.timer = setInterval(() => refresh(state, api, true), pollMs());
  state.callsTimer = setInterval(() => refreshCalls(state).catch(() => {}), Math.max(3000, pollMs()));
}

function errorStatus(error) { setStatus(error?.message || String(error)); }
