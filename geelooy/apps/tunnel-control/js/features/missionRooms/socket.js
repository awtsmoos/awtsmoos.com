// B"H

import { roomSocketUrl } from "./api.js";

/**
 * B"H
 * Chapter 919: The room listens by socket, and falls back without lying.
 *
 * No socket is opened in the lobby. A selected room gets exactly one scoped
 * connection. Any unscoped frame is ignored unless the route itself is scoped.
 */
export function openRoomSocket(state, getTunnelName, handlers = {}) {
  closeRoomSocket(state);
  if (!state.selectedMissionId || typeof WebSocket === "undefined") return fallback(state, "no-websocket");
  state.socketMode = "connecting";
  try {
    const socket = new WebSocket(roomSocketUrl(getTunnelName, state.selectedMissionId));
    state.socket = socket;
    socket.onopen = () => { state.socketMode = "websocket"; state.socketError = ""; state.socketOpenedAt = Date.now(); handlers.onStatus?.(); };
    socket.onmessage = event => handleFrame(state, event.data, handlers);
    socket.onerror = () => fallback(state, "websocket-error", handlers);
    socket.onclose = () => { if (state.socket === socket) fallback(state, "websocket-closed", handlers); };
  } catch (error) { fallback(state, error.message, handlers); }
  handlers.onStatus?.();
}

export function closeRoomSocket(state) {
  clearTimeout(state.socketReconnect);
  state.socketReconnect = 0;
  if (state.socket) try { state.socket.close(); } catch {}
  state.socket = null;
  state.socketMode = "idle";
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
  state.socket = null;
  state.socketMode = "fallback-poll";
  state.socketError = reason || "fallback";
  handlers.onStatus?.();
}

function json(text) { try { return JSON.parse(text); } catch { return null; } }
