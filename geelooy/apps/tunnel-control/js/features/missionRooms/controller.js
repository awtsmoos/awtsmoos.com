// B"H

import { $ } from "../../ui/dom.js";
import { roomAction, discoverPayload, joinPayload, statusPayload, timelinePayload } from "./api.js";
import { createRoomState, saveSelection, paramsSelection, agentId, projectRoot, pollMs } from "./state.js";
import { renderAll, renderList, renderRoom, renderOut, renderActivity, setStatus } from "./render.js";
import { send, copyRoomLink } from "./messages.js";
import { openRoomSocket, closeRoomSocket } from "./socket.js";

/** B"H: selected rooms are WebSocket-first; lobby never opens a stream. */
export function createRoomController(getTunnelName) {
  const state = createRoomState();
  const api = payload => roomAction(getTunnelName, payload);
  return { mount: () => mount(state, api, getTunnelName), join: id => join(state, api, getTunnelName, id) };
}

function mount(state, api, getTunnelName) {
  if (!$("roomLobby")) return;
  bind(state, api, getTunnelName);
  hydrateInputs(state);
  discover(state, api, getTunnelName, "boot").then(() => maybeOpenUrlRoom(state, api, getTunnelName)).catch(errorStatus);
  scheduleDiscover(state, api, getTunnelName);
}

function bind(state, api, getTunnelName) {
  $("discoverRoomsBtn") && ($("discoverRoomsBtn").onclick = () => discover(state, api, getTunnelName, "manual"));
  document.addEventListener("click", e => { if (e.target?.id === "refreshRoomBtn") refresh(state, api); });
  document.addEventListener("click", e => { if (e.target?.id === "closeRoomBtn") closeRoom(state, api, getTunnelName); });
  document.addEventListener("click", e => { if (e.target?.id === "sendRoomMessageBtn") send(state, api, false).then(() => refresh(state, api, true)); });
  document.addEventListener("click", e => { if (e.target?.id === "allowRoomContinueBtn") send(state, api, true).then(() => refresh(state, api, true)); });
  document.addEventListener("click", e => { if (e.target?.id === "copyRoomLinkBtn") copyRoomLink(state); });
  document.addEventListener("visibilitychange", () => visibility(state, api, getTunnelName));
}

function hydrateInputs(state) { state.selectedMissionId = paramsSelection().missionId || ""; }

async function discover(state, api, getTunnelName, reason = "refresh") {
  const got = await api(discoverPayload(projectRoot(), agentId()));
  state.lastResult = got;
  state.missions = got.missions || [];
  setStatus(`Showing ${state.missions.length} available rooms (${reason}).`);
  renderList(state, { join: id => join(state, api, getTunnelName, id) });
  renderOut(got);
}

async function maybeOpenUrlRoom(state, api, getTunnelName) {
  if (!state.selectedMissionId) return renderRoom(state);
  await join(state, api, getTunnelName, state.selectedMissionId, true);
}

async function join(state, api, getTunnelName, missionId, quiet = false) {
  if (!missionId) return;
  closeRoomSocket(state);
  state.selectedMissionId = missionId;
  state.timeline = [];
  state.socketMode = "connecting";
  state.selected = await api(joinPayload(missionId, { agentId: agentId(), role: "human-room", capabilities: "comment,steer,approve,block", projectRoot: projectRoot() }));
  state.lastResult = state.selected;
  saveSelection({ missionId, projectRoot: projectRoot(), agentId: agentId() });
  await loadTimeline(state, api).catch(() => {});
  if (!quiet) setStatus(`Opened room ${missionId}.`);
  renderAll(state, { join: id => join(state, api, getTunnelName, id) });
  openSocket(state, api, getTunnelName);
  scheduleRoom(state, api);
}

async function refresh(state, api, quiet = false) {
  if (!state.selectedMissionId || state.busy) return;
  state.busy = true;
  try {
    state.selected = await api(statusPayload(state.selectedMissionId));
    state.lastResult = state.selected;
    await loadTimeline(state, api).catch(() => {});
    if (!quiet) setStatus(`Room refreshed: ${state.selectedMissionId}`);
    renderRoom(state); renderActivity(state); renderOut(state.selected);
  } catch (err) { errorStatus(err); }
  finally { state.busy = false; }
}

async function loadTimeline(state, api) {
  if (!state.selectedMissionId) return;
  const got = await api(timelinePayload(state.selectedMissionId));
  state.timeline = got.timeline || [];
}

function openSocket(state, api, getTunnelName) { openRoomSocket(state, getTunnelName, { onStatus: () => renderRoom(state), onFrame: () => refresh(state, api, true) }); }
function closeRoom(state, api, getTunnelName) { closeRoomSocket(state); state.selectedMissionId = ""; state.selected = null; state.timeline = []; clearInterval(state.timer); renderAll(state, { join: id => join(state, api, getTunnelName, id) }); setStatus(`Showing ${state.missions.length} available rooms.`); }
function visibility(state, api, getTunnelName) { if (document.hidden) return closeRoomSocket(state); if (state.selectedMissionId) { openSocket(state, api, getTunnelName); refresh(state, api, true); } }
function scheduleDiscover(state, api, getTunnelName) { clearInterval(state.discoverTimer); state.discoverTimer = setInterval(() => discover(state, api, getTunnelName, "auto").catch(errorStatus), 20000); }
function scheduleRoom(state, api) { clearInterval(state.timer); state.timer = setInterval(() => refresh(state, api, true), pollMs()); }
function errorStatus(error) { setStatus(error?.message || String(error)); }
