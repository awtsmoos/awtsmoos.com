// B"H

import { $ } from "../../ui/dom.js";
import { roomAction, discoverPayload, docsCatalog, liveCalls } from "./api.js";
import { createRoomState, loadSelection, saveSelection, paramsSelection, agentId, projectRoot, pollMs, toolFilter } from "./state.js";
import { renderAll, renderList, renderRoom, renderOut, renderTools, renderCommands, setStatus } from "./render.js";
import { heartbeat } from "./loop.js";
import { send, copyRoomLink } from "./messages.js";
import { normalizeTools } from "./tools.js";
import { commandRowsFrom } from "./commands.js";

/** B"H: Rooms watch tools and current-chat tunnel calls. */
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
  refreshTools(state).catch(errorStatus);
  refreshCommands(state).catch(errorStatus);
  schedule(state, api);
}

function bind(state, api) {
  $("discoverRoomsBtn").onclick = () => discover(state, api, "manual");
  $("refreshRoomBtn").onclick = () => refresh(state, api);
  $("refreshRoomToolsBtn").onclick = () => refreshTools(state);
  $("sendRoomMessageBtn").onclick = () => send(state, api, false);
  $("allowRoomContinueBtn").onclick = () => send(state, api, true);
  $("copyRoomLinkBtn").onclick = () => copyRoomLink(state);
  $("roomToolFilter")?.addEventListener("input", () => { state.toolFilter = toolFilter(); renderTools(state); });
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
  await refreshCommands(state);
}

async function discover(state, api, reason = "refresh") {
  const got = await api(discoverPayload(projectRoot(), agentId()));
  state.lastResult = got;
  state.missions = got.missions || [];
  preserveSelection(state);
  setStatus(`Showing ${state.missions.length} rooms, ${state.tools.length} tools, ${state.commandRows.length} command rows (${reason}).`);
  renderList(state, { join: id => join(state, api, id) });
  renderOut(got);
}

function preserveSelection(state) {
  if (!state.missions.some(row => row.mission?.id === state.selectedMissionId)) {
    state.selectedMissionId = state.missions[0]?.mission?.id || "";
  }
}

async function refreshTools(state) {
  state.tools = normalizeTools(await docsCatalog());
  state.toolFilter = toolFilter();
  renderTools(state);
  setStatus(`Loaded ${state.tools.length} tunnel tools from live docs route.`);
}

async function refreshCommands(state) {
  const live = await liveCalls(state.selectedMissionId || projectRoot());
  state.liveGroups = live.groups || [];
  state.commandRows = commandRowsFrom(state, live);
  renderCommands(state);
}

async function rejoin(state, api) { if (state.selectedMissionId) await join(state, api, state.selectedMissionId, true); }

async function join(state, api, missionId, quiet = false) {
  state.selectedMissionId = missionId;
  state.selected = await api({ action: "missionProjectJoin", targetVessel: "native-tunnel", missionId, agentId: agentId(), role: "human-room", capabilities: "comment,steer,approve,block", projectRoot: projectRoot() });
  state.lastResult = state.selected;
  saveSelection({ missionId, projectRoot: projectRoot(), agentId: agentId() });
  if (!quiet) setStatus(`Joined room ${missionId}.`);
  await refreshCommands(state).catch(() => {});
  renderAll(state, { join: id => join(state, api, id) });
}

async function refresh(state, api, quiet = false) {
  if (!state.selectedMissionId || state.busy) return;
  state.busy = true;
  try {
    await heartbeat(state, api);
    state.selected = await api({ action: "missionProjectStatus", targetVessel: "native-tunnel", missionId: state.selectedMissionId });
    state.lastResult = state.selected;
    await refreshCommands(state).catch(() => {});
    if (!quiet) setStatus(`Room loaded: ${state.selectedMissionId}`);
    renderRoom(state); renderCommands(state); renderOut(state.selected);
  } catch (err) { errorStatus(err); }
  finally { state.busy = false; }
}

function schedule(state, api) {
  clearInterval(state.discoverTimer); clearInterval(state.timer); clearInterval(state.toolsTimer);
  state.discoverTimer = setInterval(() => discover(state, api, "auto").catch(errorStatus), Math.max(3500, pollMs() * 2));
  state.timer = setInterval(() => refresh(state, api, true), pollMs());
  state.toolsTimer = setInterval(() => refreshCommands(state).catch(errorStatus), Math.max(5000, pollMs()));
}

function errorStatus(error) { setStatus(error?.message || String(error)); }
