// B"H

import { eventsFromRoom, eventsFromTimeline, eventsFromActionHistory, normalizeRoomEvent, uniqueEvents, roomStatusLabel } from "./events.js";

/**
 * B"H
 * Chapter 1010: The store became a kernel, not a scrapbook.
 * Snapshots bring status, mission timeline, and action ledger; the store forges
 * them into one room OS event stream without duplicating backend truth.
 */
export function createRoomStore(state) {
  return {
    state,
    setMissions(missions = []) { state.missions = sortMissions(missions); },
    setSelected(got = {}) { state.selected = got; state.lastResult = got; rebuildEvents(state); },
    setTimeline(timeline = []) { state.timeline = timeline; rebuildEvents(state); },
    applySnapshot(snapshot = {}) {
      if (snapshot.status) state.selected = snapshot.status;
      if (Array.isArray(snapshot.timeline)) state.timeline = snapshot.timeline;
      if (Array.isArray(snapshot.actionHistory)) state.actionHistory = snapshot.actionHistory;
      if (snapshot.roomOs) state.roomOs = snapshot.roomOs;
      state.lastResult = snapshot;
      rebuildEvents(state);
    },
    pushFrame(frame = {}) {
      state.events = uniqueEvents([...(state.events || []), normalizeRoomEvent(frame, { roomId: state.selectedMissionId, type: frame.kind || "socket" })]);
    },
    metrics() { return metrics(state); }
  };
}

export function selectedRoom(state) {
  const got = state.selected || {};
  return got.collaboration || got.mission?.collaboration || got.status?.collaboration || got.status?.mission?.collaboration || {};
}

export function selectedMission(state) {
  const got = state.selected || {};
  return got.mission || got.report || got.status?.mission || got.status?.report || { id: state.selectedMissionId, goal: state.selectedMissionId };
}

export function metrics(state) {
  const os = state.roomOs?.metrics;
  if (os) return fromRoomOsMetrics(state, os);
  const room = selectedRoom(state), events = state.events || [];
  return {
    agents: (room.agents || []).length,
    actions: events.filter(e => !String(e.type).includes("message")).length,
    messages: events.filter(e => String(e.type).includes("message") || e.payload?.body).length,
    writes: events.filter(e => /write|patch|replace/i.test(e.type + " " + e.title)).length,
    reads: events.filter(e => /read|list|grep|search/i.test(e.type + " " + e.title)).length,
    browser: events.filter(e => /chrome|browser|screenshot/i.test(e.type + " " + e.title)).length,
    status: streamLabel(state)
  };
}

function fromRoomOsMetrics(state, os = {}) {
  return {
    agents: os.agents || 0,
    actions: os.actions || 0,
    messages: (state.events || []).filter(e => String(e.type).includes("message") || e.payload?.body).length,
    writes: os.filesystem || 0,
    reads: os.filesystem || 0,
    browser: os.browser || 0,
    command: os.command || 0,
    failed: os.failed || 0,
    status: streamLabel(state)
  };
}

function streamLabel(state) {
  if (state.socketMode === "websocket") return "websocket";
  if (state.socketMode === "eventsource") return "eventsource";
  if (state.selectedMissionId) return "fallback";
  return "lobby";
}

function rebuildEvents(state) {
  const room = selectedRoom(state);
  const sockets = (state.events || []).filter(e => e.type === "socket");
  state.events = uniqueEvents([
    ...eventsFromRoom(room, state.selectedMissionId),
    ...eventsFromTimeline(state.timeline || [], state.selectedMissionId),
    ...eventsFromActionHistory(state.actionHistory || [], state.selectedMissionId),
    ...sockets
  ]);
}

function sortMissions(missions = []) {
  return [...missions].sort((a, b) => score(b) - score(a));
}

function score(row = {}) {
  const status = roomStatusLabel(row);
  const base = status === "needs human" ? 300 : status === "running" ? 200 : status === "active" ? 100 : 0;
  const updated = Date.parse(row.updatedAt || row.mission?.updatedAt || 0) || 0;
  return base + updated / 100000000000;
}
