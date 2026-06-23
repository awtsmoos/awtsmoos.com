// B"H
const { json } = require("../core/respond.js");
const { currentIdentity } = require("../core/auth.js");
const { getConversation, listConversations } = require("../core/conversationStore.js");

function params($i) {
  return { ...($i?.paramKinds?.GET || {}), ...($i?.paramKinds?.POST || {}) };
}

function number(value, fallback, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(Math.floor(n), max));
}

async function liveCalls($i) {
  const ident = currentIdentity($i);
  if (!ident.ok) return json($i, { BH: "B\"H", ok: false, error: "not_authenticated" }, 401);
  const p = params($i);
  const limit = number(p.limit, 200, 20, 1000);
  const offset = number(p.offset, 0, 0, 1000000);
  const groupBy = String(p.groupBy || "conversation").trim() || "conversation";
  const filter = String(p.filter || p.q || "").trim().toLowerCase();
  const rows = allEvents(ident.userId)
    .filter(row => !filter || JSON.stringify(row).toLowerCase().includes(filter))
    .sort((a, b) => b.at - a.at);
  const page = rows.slice(offset, offset + limit);
  return json($i, {
    BH: "B\"H",
    ok: true,
    total: rows.length,
    offset,
    limit,
    hasMore: offset + limit < rows.length,
    nextOffset: offset + limit < rows.length ? offset + limit : null,
    groupBy,
    groups: groupRows(page, groupBy),
    events: page
  });
}

function allEvents(userId) {
  const conversations = listConversations(userId);
  const out = [];
  for (const convo of conversations) {
    const full = getConversation(userId, convo.id);
    for (const event of full?.events || []) {
      out.push({
        ...event,
        conversationId: full.id,
        conversationName: full.name,
        groupKeys: {
          conversation: full.id,
          tunnel: event.tunnelName || "unknown",
          action: event.action || event.kind || "unknown",
          vessel: event.targetVessel || "unknown",
          ok: event.ok === false ? "failed" : "ok"
        }
      });
    }
  }
  return out;
}

function groupRows(rows, groupBy) {
  const groups = new Map();
  for (const row of rows) {
    const key = row.groupKeys?.[groupBy] || row.groupKeys?.conversation || "unknown";
    const current = groups.get(key) || {
      key,
      groupBy,
      title: titleFor(row, groupBy, key),
      count: 0,
      ok: 0,
      failed: 0,
      firstAt: row.at,
      lastAt: row.at,
      events: []
    };
    current.count += 1;
    if (row.ok === false) current.failed += 1; else current.ok += 1;
    current.firstAt = Math.min(current.firstAt, row.at);
    current.lastAt = Math.max(current.lastAt, row.at);
    if (current.events.length < 20) current.events.push(row);
    groups.set(key, current);
  }
  return Array.from(groups.values()).sort((a, b) => b.lastAt - a.lastAt);
}

function titleFor(row, groupBy, key) {
  if (groupBy === "conversation") return row.conversationName || key;
  if (groupBy === "tunnel") return row.tunnelName || key;
  if (groupBy === "action") return row.action || row.kind || key;
  if (groupBy === "vessel") return row.targetVessel || key;
  if (groupBy === "ok") return key;
  return key;
}

module.exports = { liveCalls, allEvents, groupRows };
