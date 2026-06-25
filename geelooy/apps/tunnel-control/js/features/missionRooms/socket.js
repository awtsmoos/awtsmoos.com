// B"H

import { roomSocketUrl, roomStreamUrl } from "./api.js";

/** B"H: WebSocket first, EventSource second, selected-room polling third. */
export function openRoomSocket(state, getTunnelName, handlers = {}) {
  closeRoomSocket(state);
  if (!state.selectedMissionId) return fallback(state, "no-room", handlers);
  state.socketMode = "connecting";
  if (typeof WebSocket === "undefined") return openEventSource(state, getTunnelName, handlers, "no-websocket");
  try {
    const socket = new WebSocket(roomSocketUrl(getTunnelName, state.selectedMissionId));
    state.socket = socket;
    socket.onopen = () => { state.socketMode = "websocket"; state.socketError = ""; state.socketOpenedAt = Date.now(); handlers.onStatus?.(); };
    socket.onmessage = event => handleFrame(state, event.data, handlers);
    socket.onerror = () => openEventSource(state, getTunnelName, handlers, "websocket-error");
    socket.onclose = () => { if (state.socket === socket) openEventSource(state, getTunnelName, handlers, "websocket-closed"); };
  } catch (error) { openEventSource(state, getTunnelName, handlers, error.message); }
  handlers.onStatus?.();
}

export function closeRoomSocket(state) {
  clearTimeout(state.socketReconnect); state.socketReconnect = 0;
  if (state.socket) try { state.socket.close(); } catch {}
  if (state.eventSource) try { state.eventSource.close(); } catch {}
  state.socket = null; state.eventSource = null; state.socketMode = "idle";
}

function openEventSource(state, getTunnelName, handlers, reason) {
  if (state.socket) try { state.socket.close(); } catch {}
  state.socket = null;
  if (typeof EventSource === "undefined") return fallback(state, reason || "no-eventsource", handlers);
  try {
    const stream = new EventSource(roomStreamUrl(getTunnelName, state.selectedMissionId));
    state.eventSource = stream; state.socketMode = "eventsource"; state.socketError = reason || "websocket-fallback";
    stream.onopen = () => { state.socketMode = "eventsource"; handlers.onStatus?.(); };
    stream.addEventListener("snapshot", event => handleFrame(state, event.data, handlers));
    stream.onerror = () => fallback(state, "eventsource-error", handlers);
  } catch (error) { fallback(state, error.message, handlers); }
  handlers.onStatus?.();
}

function handleFrame(state, raw, handlers) {
  const got = json(raw);
  if (!got) return;
  const missionId = got.missionId || got.room || got.event?.missionId || got.snapshot?.missionId || "";
  if (missionId && missionId !== state.selectedMissionId) return;
  handlers.onFrame?.(got);
}

function fallback(state, reason, handlers = {}) {
  if (state.socket) try { state.socket.close(); } catch {}
  if (state.eventSource) try { state.eventSource.close(); } catch {}
  state.socket = null; state.eventSource = null; state.socketMode = "fallback-poll"; state.socketError = reason || "fallback"; handlers.onStatus?.();
}
function json(text) { try { return JSON.parse(text); } catch { return null; } }
