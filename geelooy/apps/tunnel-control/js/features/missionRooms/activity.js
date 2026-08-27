// B"H

/**
 * B"H
 * Chapter 1011: Activity became the indexed breath of the room.
 * Ledger inputs, mission messages, browser footsteps, and file sparks are
 * searched as one stream without hiding their native shape.
 */
export function activityRows(state, query = "") {
  const q = String(query || "").trim().toLowerCase();
  return [...(state.events || [])]
    .filter(event => !q || searchable(event).includes(q))
    .sort((a, b) => String(b.at).localeCompare(String(a.at)));
}

export function conversationRows(state) {
  return (state.events || []).filter(event => event.type.includes("message") || event.payload?.body || event.payload?.subject);
}

export function fileRows(state) {
  const seen = new Map();
  for (const event of state.events || []) {
    const path = filePath(event);
    if (!path || !path.includes(".")) continue;
    const got = seen.get(path) || { path, count: 0, lastAt: event.at, events: [], actions: new Set() };
    got.count += 1;
    got.lastAt = event.at || got.lastAt;
    got.actions.add(event.payload?.action || event.type);
    if (got.events.length < 8) got.events.push(event);
    seen.set(path, got);
  }
  return [...seen.values()].map(row => ({ ...row, actions: [...row.actions] })).sort((a, b) => String(b.lastAt).localeCompare(String(a.lastAt)));
}

export function agentRows(state) {
  const agents = new Map();
  for (const event of state.events || []) {
    const key = event.actor || event.payload?.input?.agentId || "room";
    const got = agents.get(key) || { agentId: key, count: 0, lastAt: event.at, lastType: event.type, failures: 0 };
    got.count += 1;
    got.lastAt = event.at || got.lastAt;
    got.lastType = event.type || got.lastType;
    if (event.status === "failed" || event.payload?.ok === false) got.failures += 1;
    agents.set(key, got);
  }
  return [...agents.values()].sort((a, b) => String(b.lastAt).localeCompare(String(a.lastAt)));
}

export function actionRows(state, group = "") {
  return (state.events || []).filter(event => event.type.startsWith("action:") && (!group || event.payload?.group === group));
}

export function summarizeEvent(event = {}) {
  const time = readableTime(event.at);
  return `${time} · ${event.actor || "room"} · ${event.type || "event"} · ${event.title || ""}`;
}

export function readableTime(value) {
  const n = Date.parse(value || "");
  return Number.isFinite(n) ? new Date(n).toLocaleTimeString() : "";
}

export function filePath(event = {}) {
  const p = event.payload || {}, input = p.input || {};
  return p.path || p.file || p.absolutePath || p.target || input.path || input.p || input.cwd || input.url || "";
}

function searchable(event = {}) {
  const p = event.payload || {}, input = p.input || {};
  return [event.id, event.roomId, event.actor, event.target, event.type, event.title, event.status, p.action, p.actionId, p.outputRef, input.command, input.path, input.p, input.cwd, input.url, JSON.stringify(p)].join(" ").toLowerCase();
}
