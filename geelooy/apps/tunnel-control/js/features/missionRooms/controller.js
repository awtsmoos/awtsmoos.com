// B"H

import { $ } from "../../ui/dom.js";
import { roomAction, discoverPayload, startPayload, joinPayload, statusPayload, timelinePayload } from "./api.js";
import { createRoomState, saveSelection, paramsSelection, agentId, projectRoot, pollMs } from "./state.js";
import { renderAll, renderList, renderRoom, renderOut, renderActivity, setStatus } from "./render.js";
import { send, copyRoomLink } from "./messages.js";
import { openRoomSocket, closeRoomSocket } from "./socket.js";
import { createRoomStore } from "./store.js";
import { templateGoal } from "./templates.js";
import { replayStep, replayLive } from "./replay.js";
import { setReview } from "./review.js";

/** B"H: Room OS controller with templates, replay, and local review. */
export function createRoomController(getTunnelName) {
  const state = createRoomState(), store = createRoomStore(state), api = payload => roomAction(getTunnelName, payload);
  return { mount: () => mount(state, store, api, getTunnelName), join: id => join(state, store, api, getTunnelName, id) };
}
function mount(state, store, api, getTunnelName) { if (!$("roomLobby")) return; bind(state, store, api, getTunnelName); hydrateInputs(state); discover(state, store, api, getTunnelName, "boot").then(() => maybeOpenUrlRoom(state, store, api, getTunnelName)).catch(errorStatus); scheduleDiscover(state, store, api, getTunnelName); }
function bind(state, store, api, getTunnelName) { $("discoverRoomsBtn") && ($("discoverRoomsBtn").onclick = () => discover(state, store, api, getTunnelName, "manual")); document.addEventListener("click", e => routeClick(e, state, store, api, getTunnelName)); document.addEventListener("input", e => routeInput(e, state, store, api, getTunnelName)); document.addEventListener("change", e => routeChange(e, state, store, api, getTunnelName)); document.addEventListener("visibilitychange", () => visibility(state, store, api, getTunnelName)); }
function routeClick(e, state, store, api, getTunnelName) {
  const id = e.target?.id || "";
  if (id === "createRoomBtn") return createRoom(state, store, api, getTunnelName);
  if (id === "refreshRoomBtn") return refresh(state, store, api);
  if (id === "closeRoomBtn") return closeRoom(state, store, api, getTunnelName);
  if (id === "sendRoomMessageBtn") return send(state, api, false).then(got => { store.setSelected(got); refresh(state, store, api, true); });
  if (id === "allowRoomContinueBtn") return send(state, api, true).then(got => { store.setSelected(got); refresh(state, store, api, true); });
  if (id === "copyRoomLinkBtn") return copyRoomLink(state);
  if (id === "replayStartBtn") return replayStart(state);
  if (id === "replayPrevBtn") return replayMove(state, -1);
  if (id === "replayNextBtn") return replayMove(state, 1);
  if (id === "replayLiveBtn") return replayStop(state);
  if (id.startsWith("reviewApprove:")) return review(state, id, "approved");
  if (id.startsWith("reviewReject:")) return review(state, id, "rejected");
  if (id.startsWith("reviewChanges:")) return review(state, id, "changes-requested");
  const eventId = e.target?.dataset?.eventId || e.target?.closest?.("[data-event-id]")?.dataset?.eventId;
  if (eventId) { state.selectedEventId = eventId; renderRoom(state); }
}
function routeInput(e, state, store, api, getTunnelName) { if (e.target?.id === "roomSearch") { state.search = e.target.value || ""; renderList(state, joiner(state, store, api, getTunnelName)); } if (e.target?.id === "roomEventSearch") { state.eventSearch = e.target.value || ""; renderRoom(state); } }
function routeChange(e, state, store, api, getTunnelName) { if (e.target?.id === "roomFilter") { state.filter = e.target.value || "all"; renderList(state, joiner(state, store, api, getTunnelName)); } if (e.target?.id === "roomTemplateSelect") applyTemplate(state, e.target.value || ""); }
function applyTemplate(state, key) { state.selectedTemplate = key; const goal = templateGoal(key); if (goal && $("newRoomGoal")) $("newRoomGoal").value = goal; }
function replayStart(state) { state.replayEnabled = true; state.replayPlaying = true; state.replayIndex = 0; clearInterval(state.replayTimer); state.replayTimer = setInterval(() => { replayStep(state, 1); if ((state.replayIndex || 0) >= (state.events || []).length - 1) { clearInterval(state.replayTimer); state.replayPlaying = false; } renderRoom(state); }, 900); renderRoom(state); }
function replayMove(state, delta) { clearInterval(state.replayTimer); state.replayPlaying = false; replayStep(state, delta); renderRoom(state); }
function replayStop(state) { clearInterval(state.replayTimer); replayLive(state); renderRoom(state); }
function review(state, id, status) { setReview(state, id.split(":").slice(1).join(":"), status); renderRoom(state); }
function hydrateInputs(state) { state.selectedMissionId = paramsSelection().missionId || ""; }
function joiner(state, store, api, getTunnelName) { return { join: id => join(state, store, api, getTunnelName, id) }; }
async function createRoom(state, store, api, getTunnelName) { if (state.creatingRoom) return; state.creatingRoom = true; try { const goal = $("newRoomGoal")?.value || templateGoal(state.selectedTemplate) || "New mission room"; const got = await api(startPayload(goal, projectRoot(), agentId())); setStatus(`Created room ${got.missionId || got.mission?.id || ""}.`); await discover(state, store, api, getTunnelName, "after-create"); if (got.missionId || got.mission?.id) await join(state, store, api, getTunnelName, got.missionId || got.mission.id); } catch (err) { errorStatus(err); } finally { state.creatingRoom = false; } }
async function discover(state, store, api, getTunnelName, reason = "refresh") { const got = await api(discoverPayload(projectRoot(), agentId())); state.lastResult = got; store.setMissions(got.missions || []); setStatus(`Showing ${state.missions.length} available rooms (${reason}).`); renderList(state, joiner(state, store, api, getTunnelName)); renderOut(got); }
async function maybeOpenUrlRoom(state, store, api, getTunnelName) { if (!state.selectedMissionId) return renderRoom(state); await join(state, store, api, getTunnelName, state.selectedMissionId, true); }
async function join(state, store, api, getTunnelName, missionId, quiet = false) { if (!missionId) return; closeRoomSocket(state); clearInterval(state.replayTimer); state.selectedMissionId = missionId; state.timeline = []; state.events = []; state.selectedEventId = ""; state.replayEnabled = false; state.socketMode = "connecting"; store.setSelected(await api(joinPayload(missionId, { agentId: agentId(), role: "human-room", capabilities: "comment,steer,approve,block", projectRoot: projectRoot() }))); saveSelection({ missionId, projectRoot: projectRoot(), agentId: agentId() }); await loadTimeline(state, store, api).catch(() => {}); if (!quiet) setStatus(`Opened room ${missionId}.`); renderAll(state, joiner(state, store, api, getTunnelName)); openSocket(state, store, api, getTunnelName); scheduleRoom(state, store, api); }
async function refresh(state, store, api, quiet = false) { if (!state.selectedMissionId || state.busy) return; state.busy = true; try { store.setSelected(await api(statusPayload(state.selectedMissionId))); await loadTimeline(state, store, api).catch(() => {}); if (!quiet) setStatus(`Room refreshed: ${state.selectedMissionId}`); renderRoom(state); renderActivity(state); renderOut(state.selected); } catch (err) { errorStatus(err); } finally { state.busy = false; } }
async function loadTimeline(state, store, api) { if (!state.selectedMissionId) return; const got = await api(timelinePayload(state.selectedMissionId)); store.setTimeline(got.timeline || []); }
function openSocket(state, store, api, getTunnelName) { openRoomSocket(state, getTunnelName, { onStatus: () => renderRoom(state), onFrame: frame => handleStreamFrame(state, store, api, frame) }); }
function handleStreamFrame(state, store, api, frame) { if (frame.kind === "mission-room-snapshot") store.applySnapshot(frame); else store.pushFrame(frame); if (!state.replayEnabled) state.replayIndex = Math.max(0, (state.events || []).length - 1); renderRoom(state); if (state.socketMode === "fallback-poll") refresh(state, store, api, true); }
function closeRoom(state, store, api, getTunnelName) { closeRoomSocket(state); clearInterval(state.replayTimer); state.selectedMissionId = ""; state.selected = null; state.timeline = []; state.events = []; state.selectedEventId = ""; state.replayEnabled = false; clearInterval(state.timer); renderAll(state, joiner(state, store, api, getTunnelName)); setStatus(`Showing ${state.missions.length} available rooms.`); }
function visibility(state, store, api, getTunnelName) { if (document.hidden) return closeRoomSocket(state); if (state.selectedMissionId) { openSocket(state, store, api, getTunnelName); refresh(state, store, api, true); } }
function scheduleDiscover(state, store, api, getTunnelName) { clearInterval(state.discoverTimer); state.discoverTimer = setInterval(() => discover(state, store, api, getTunnelName, "auto").catch(errorStatus), 20000); }
function scheduleRoom(state, store, api) { clearInterval(state.timer); state.timer = setInterval(() => refresh(state, store, api, true), pollMs()); }
function errorStatus(error) { setStatus(error?.message || String(error)); }
