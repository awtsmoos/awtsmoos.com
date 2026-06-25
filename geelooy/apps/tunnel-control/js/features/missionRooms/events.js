// B"H

/**
 * B"H
 * Chapter 1009: Real actions entered the room event river.
 * Mission messages, timeline rows, and ledger deeds now share one vessel so
 * every pane can see the same Awtsmoos-light from a different angle.
 */
export function eventId(prefix = "evt") {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function normalizeRoomEvent(input = {}, fallback = {}) {
  const payload = input.payload || input.event || input;
  const type = input.type || input.kind || payload.type || payload.kind || fallback.type || "event";
  const at = input.at || input.createdAt || input.updatedAt || payload.at || payload.createdAt || new Date().toISOString();
  const actor = input.actor || input.agentId || input.fromAgent || payload.actor || payload.agentId || payload.fromAgent || fallback.actor || "room";
  const target = input.target || input.toAgent || input.targetVessel || payload.target || payload.toAgent || payload.targetVessel || fallback.target || "mission";
  const title = input.title || input.msg || input.body || input.subject || payload.title || payload.msg || payload.body || payload.subject || type;
  return pack(input.id || payload.id || eventId(type), input.roomId || input.missionId || payload.roomId || payload.missionId || fallback.roomId, at, actor, target, type, title, input.status || payload.status || fallback.status || "ok", payload);
}

export function eventsFromRoom(room = {}, missionId = "") {
  const messages = [...(room.messages || []), ...(room.userMessages || [])];
  return messages.map(message => normalizeRoomEvent(message, { roomId: missionId, type: message.kind || "message" }));
}

export function eventsFromTimeline(timeline = [], missionId = "") {
  return timeline.map(row => normalizeRoomEvent(row, { roomId: missionId, type: row.type || "timeline" }));
}

export function eventsFromActionHistory(history = [], missionId = "") {
  return (history || []).map(entry => actionEvent(entry, missionId));
}

export function actionGroup(action = "") {
  if (/^(command|shellCommand|commandRun|commandStart|node|npm|test|build)/.test(action)) return "command";
  if (/^(read|write|bulkWrite|move|copy|delete|mkdir|ensureFile|touch|applyPatch|replace)/.test(action)) return "filesystem";
  if (/^(chrome|browser|remoteDesktop|http|network)/.test(action)) return "browser";
  if (/^mission/.test(action)) return "mission";
  if (/^(ai|agent)/.test(action)) return "agent";
  return "other";
}

export function uniqueEvents(events = []) {
  const seen = new Set();
  return events.filter(event => {
    const key = event.id || `${event.at}:${event.actor}:${event.type}:${event.title}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).sort((a, b) => String(a.at).localeCompare(String(b.at)));
}

export function roomStatusLabel(row = {}) {
  const room = row.collaboration || {};
  if ((room.openUserMessages || []).length) return "needs human";
  if ((room.activeClaims || []).length) return "running";
  if ((room.agents || []).length) return "active";
  return "quiet";
}

function actionEvent(entry = {}, missionId = "") {
  const input = entry.input || {};
  const action = entry.action || input.action || "action";
  const group = actionGroup(action);
  const path = input.path || input.p || input.cwd || input.url || input.target || "";
  const title = [action, path].filter(Boolean).join(" · ");
  return pack(entry.actionId || eventId(action), missionId || input.missionId || "", entry.createdAt, input.agentId || input.logicalAgentId || group, input.targetVessel || path || group, `action:${group}`, title, entry.ok === false ? "failed" : "ok", { ...entry, group });
}

function pack(id, roomId, at, actor, target, type, title, status, payload) {
  return { id, roomId: roomId || "", parentEventId: payload?.parentActionId || payload?.parentEventId || "", at, actor: String(actor || "room"), target: String(target || "mission"), type: String(type || "event"), title: String(title || "event"), status, payload };
}
