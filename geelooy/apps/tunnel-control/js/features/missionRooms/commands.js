// B"H

/** B"H: Combines selected-room messages with matching live tunnel calls. */
export function commandRowsFrom(state, live = {}) {
  const rows = [...fromLive(live.events || []), ...fromRoom(state.selected || {})];
  return rows.sort((a, b) => Number(b.at || 0) - Number(a.at || 0)).slice(0, 80);
}

function fromLive(events) {
  return events.map(event => ({
    agent: event.agentId || event.fromAgent || event.conversationName || "agent/chat",
    action: event.action || event.kind || "tunnel-call",
    target: event.targetVessel || event.tunnelName || "tunnel",
    status: event.ok === false ? "failed" : "ok",
    at: event.at || Date.now(),
    detail: event.path || event.title || event.summary || event.url || event.id || ""
  }));
}

function fromRoom(got) {
  const room = got.collaboration || got.mission?.collaboration || {};
  const messages = [...(room.messages || []), ...(room.userMessages || [])];
  return messages.map(msg => ({
    agent: msg.fromAgent || msg.from || "room",
    action: msg.currentAction || msg.action || msg.kind || "room-message",
    target: msg.toAgent || msg.targetVessel || "room",
    status: msg.status || "seen",
    at: msg.at || Date.now(),
    detail: msg.body || msg.subject || msg.note || ""
  }));
}
