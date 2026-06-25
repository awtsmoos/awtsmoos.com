// B"H
const { json } = require("../core/respond.js");
const { currentIdentity } = require("../core/auth.js");
const { getConversationBucketSnapshot } = require("../core/conversationStore.js");

/**
 * B"H
 * Chapter 912: Live calls learned to flow, not merely be fetched.
 *
 * The WebSocket upgrade gate belongs to the host runtime. This route therefore
 * adds the honest server-push vessel available here: EventSource snapshots.
 */
async function liveCalls($i) {
  const ident = currentIdentity($i);
  if (!ident.ok) return json($i, packet(false, { error: "not_authenticated" }), 401);
  return json($i, snapshot(ident.userId, options($i)));
}

async function liveCallsStream($i) {
  const ident = currentIdentity($i);
  if (!ident.ok) return json($i, packet(false, { error: "not_authenticated" }), 401);
  const res = $i.response || $i.res;
  const req = $i.request || $i.req;
  if (!res?.write) return json($i, snapshot(ident.userId, options($i)));
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-store, max-age=0");
  res.setHeader("Connection", "keep-alive");
  res.write(": awtsmoos live actions stream\n\n");
  return new Promise(resolve => {
    const send = () => writeEvent(res, "snapshot", snapshot(ident.userId, options($i)));
    const beat = () => res.write(`: heartbeat ${Date.now()}\n\n`);
    const tick = setInterval(send, 2000);
    const pulse = setInterval(beat, 15000);
    const close = () => { clearInterval(tick); clearInterval(pulse); resolve(""); };
    req?.on?.("close", close);
    res.on?.("close", close);
    send();
  });
}

function options($i) {
  const p = { ...($i?.paramKinds?.GET || {}), ...($i?.paramKinds?.POST || {}) };
  return { limit: number(p.limit, 100, 20, 500), offset: number(p.offset, 0, 0, 1000000), groupBy: String(p.groupBy || "conversation").trim() || "conversation", filter: String(p.filter || p.q || "").trim().toLowerCase() };
}

function snapshot(userId, opts) {
  const rows = allEvents(userId).filter(row => !opts.filter || searchable(row).includes(opts.filter)).sort((a, b) => Number(b.at || 0) - Number(a.at || 0));
  const events = rows.slice(opts.offset, opts.offset + opts.limit);
  return packet(true, { total: rows.length, offset: opts.offset, limit: opts.limit, hasMore: opts.offset + opts.limit < rows.length, nextOffset: opts.offset + opts.limit < rows.length ? opts.offset + opts.limit : null, groupBy: opts.groupBy, groups: groupRows(events, opts.groupBy), events, serverPush: "eventsource" });
}

function allEvents(userId) {
  const out = [];
  for (const full of getConversationBucketSnapshot(userId).conversations || []) for (const event of full?.events || []) out.push({ ...event, conversationId: full.id, conversationName: full.name, groupKeys: { conversation: full.id, tunnel: event.tunnelName || "unknown", action: event.action || event.kind || "unknown", vessel: event.targetVessel || "unknown", ok: event.ok === false ? "failed" : "ok" } });
  return out;
}

function groupRows(rows, groupBy) {
  const groups = new Map();
  for (const row of rows) {
    const key = row.groupKeys?.[groupBy] || row.groupKeys?.conversation || "unknown";
    const got = groups.get(key) || { key, groupBy, title: titleFor(row, groupBy, key), count: 0, ok: 0, failed: 0, firstAt: row.at, lastAt: row.at, events: [] };
    got.count += 1; row.ok === false ? got.failed += 1 : got.ok += 1;
    got.firstAt = Math.min(Number(got.firstAt || row.at || 0), Number(row.at || 0));
    got.lastAt = Math.max(Number(got.lastAt || row.at || 0), Number(row.at || 0));
    if (got.events.length < 10) got.events.push(row);
    groups.set(key, got);
  }
  return [...groups.values()].sort((a, b) => Number(b.lastAt || 0) - Number(a.lastAt || 0));
}

function searchable(row) { return [row.id, row.kind, row.action, row.title, row.tunnelName, row.targetVessel, row.path, row.previewId, row.viewUrl, row.summary, row.conversationId, row.conversationName, row.ok === false ? "failed" : "ok"].filter(Boolean).join(" ").toLowerCase(); }
function titleFor(row, groupBy, key) { return groupBy === "conversation" ? row.conversationName || key : groupBy === "tunnel" ? row.tunnelName || key : groupBy === "action" ? row.action || row.kind || key : groupBy === "vessel" ? row.targetVessel || key : key; }
function writeEvent(res, event, data) { res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`); }
function number(value, fallback, min, max) { const n = Number(value); return Number.isFinite(n) ? Math.max(min, Math.min(Math.floor(n), max)) : fallback; }
function packet(ok, extra) { return { BH: "B\"H", ok, ...extra }; }

module.exports = { allEvents, groupRows, liveCalls, liveCallsStream, snapshot };