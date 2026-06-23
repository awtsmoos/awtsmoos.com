// B"H
const { json } = require("../core/respond.js");
const { currentIdentity } = require("../core/auth.js");
const { getConversationBucketSnapshot } = require("../core/conversationStore.js");

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
  const limit = number(p.limit, 100, 20, 200);
  const offset = number(p.offset, 0, 0, 1000000);
  const groupBy = String(p.groupBy || "conversation").trim() || "conversation";
  const filter = String(p.filter || p.q || "").trim().toLowerCase();

  const rows = allEvents(ident.userId)
    .filter(row => !filter || searchable(row).includes(filter))
    .sort((a, b) => Number(b.at || 0) - Number(a.at || 0));

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
  const snapshot = getConversationBucketSnapshot(userId);
  const out = [];

  for (const full of snapshot.conversations || []) {
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

function searchable(row) {
  return [
    row.id,
    row.kind,
    row.action,
    row.title,
    row.tunnelName,
    row.targetVessel,
    row.path,
    row.previewId,
    row.viewUrl,
    row.summary,
    row.conversationId,
    row.conversationName,
    row.ok === false ? "failed" : "ok"
  ].filter(Boolean).join(" ").toLowerCase();
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
    if (row.ok === false) current.failed += 1;
    else current.ok += 1;

    current.firstAt = Math.min(Number(current.firstAt || row.at || 0), Number(row.at || 0));
    current.lastAt = Math.max(Number(current.lastAt || row.at || 0), Number(row.at || 0));

    if (current.events.length < 10) current.events.push(row);
    groups.set(key, current);
  }

  return Array.from(groups.values()).sort((a, b) => Number(b.lastAt || 0) - Number(a.lastAt || 0));
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