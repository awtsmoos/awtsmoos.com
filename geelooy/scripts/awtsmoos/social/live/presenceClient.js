// B"H
/**
 * @module PresenceClient
 * @description
 * Chapter 466: The browser enters the room and discovers it is not alone. This
 * client is small on purpose: one socket, one page channel, one badge event, no
 * database residue, no second API kingdom.
 */

export const presenceState = {
  connected: false,
  status: "idle",
  channel: "page:/social",
  aliasId: "ikar",
  count: 0,
  people: [],
  socket: null,
  lastEvent: null
};

function emit() {
  window.dispatchEvent(new CustomEvent("BH_PAGE_PRESENCE", { detail: presenceState }));
}

function parse(data) {
  try { return JSON.parse(data); } catch { return { type: "PAGE_TEXT", text: String(data) }; }
}

export function connectPagePresence({ aliasId = "ikar", channel = "page:/social" } = {}) {
  if (presenceState.socket && presenceState.socket.readyState <= 1) return presenceState;
  const proto = location.protocol === "https:" ? "wss" : "ws";
  const ws = new WebSocket(`${proto}://${location.host}`);
  presenceState.socket = ws;
  presenceState.aliasId = aliasId;
  presenceState.channel = channel;
  presenceState.status = "connecting";
  emit();

  ws.onopen = () => {
    presenceState.connected = true;
    presenceState.status = "connected";
    ws.send(JSON.stringify({ type: "LOGIN", aliasId }));
    ws.send(JSON.stringify({ type: "PAGE_ENTER", aliasId, channel, status: "viewing" }));
    emit();
  };

  ws.onmessage = event => {
    const message = parse(event.data);
    presenceState.lastEvent = message;
    if (message.type === "PAGE_PRESENCE" && message.channel === presenceState.channel) {
      presenceState.count = Number(message.count || 0);
      presenceState.people = Array.isArray(message.people) ? message.people : [];
      presenceState.status = "live";
    }
    emit();
  };

  ws.onerror = () => {
    presenceState.status = "error";
    emit();
  };

  ws.onclose = () => {
    presenceState.connected = false;
    presenceState.status = "closed";
    emit();
  };

  return presenceState;
}

export function sendPageTyping(typing = true) {
  if (!presenceState.socket || presenceState.socket.readyState !== 1) return false;
  presenceState.socket.send(JSON.stringify({ type: "PAGE_TYPING", aliasId: presenceState.aliasId, channel: presenceState.channel, typing }));
  return true;
}

export function sendPageReading(reading = location.pathname) {
  if (!presenceState.socket || presenceState.socket.readyState !== 1) return false;
  presenceState.socket.send(JSON.stringify({ type: "PAGE_READING", aliasId: presenceState.aliasId, channel: presenceState.channel, reading }));
  return true;
}

export function leavePagePresence() {
  if (!presenceState.socket || presenceState.socket.readyState !== 1) return false;
  presenceState.socket.send(JSON.stringify({ type: "PAGE_LEAVE", aliasId: presenceState.aliasId, channel: presenceState.channel }));
  return true;
}
