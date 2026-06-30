// B"H
const { json } = require("../core/respond.js");
const { currentIdentity } = require("../core/auth.js");

/** B"H — Chapter 1008: The mission room stopped drinking from the global river. */
async function missionRoomStream($i) {
  const ident = currentIdentity($i);
  if (!ident.ok) return json($i, packet(false, { error: "not_authenticated" }), 401);
  const opts = options($i);
  if (!opts.missionId) return json($i, packet(false, { error: "missing_missionId" }), 400);
  const res = $i.response || $i.res, req = $i.request || $i.req;
  if (!res?.write) return json($i, await snapshot($i, opts));
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-store, max-age=0");
  res.setHeader("Connection", "keep-alive");
  res.write(`: awtsmoos mission room ${opts.missionId}\n\n`);
  return new Promise(resolve => { let closed = false; const send = async () => !closed && writeEvent(res, "snapshot", await snapshot($i, opts)); const beat = () => !closed && res.write(`: heartbeat ${Date.now()}\n\n`); const tick = setInterval(send, opts.pollMs); const pulse = setInterval(beat, 15000); const close = () => { closed = true; clearInterval(tick); clearInterval(pulse); resolve(""); }; req?.on?.("close", close); res.on?.("close", close); send(); });
}
async function snapshot($i, opts) {
  const scoped = scopedPayload(opts);
  const [status, timeline, history] = await Promise.all([
    ask($i, opts, { action: "missionProjectStatus", missionId: opts.missionId }),
    ask($i, opts, { action: "missionTimeline", missionId: opts.missionId }),
    ask($i, opts, { action: "actionHistoryList", limit: opts.historyLimit, ...scoped })
  ]);
  const historyEntries = Array.isArray(history?.history) ? history.history : [];
  return packet(true, { kind: "mission-room-snapshot", missionId: opts.missionId, scopedHistory: scoped, at: Date.now(), status, timeline: timeline?.timeline || [], actionHistory: historyEntries, roomOs: summarizeRoomOs(historyEntries, timeline?.timeline || [], status), serverPush: "eventsource" });
}
function scopedPayload(opts) { return Object.fromEntries(Object.entries({ missionId: opts.missionId, conversationId: opts.conversationId, conversationName: opts.conversationName, agentSessionId: opts.agentSessionId, logicalAgentId: opts.logicalAgentId, clientRequestId: opts.clientRequestId, tunnelName: opts.tunnelName }).filter(([, v]) => v)); }
function summarizeRoomOs(history, timeline, status) { const buckets = { command: 0, filesystem: 0, browser: 0, mission: 0, failed: 0, other: 0 }; for (const entry of history) buckets[classify(entry)] += 1; for (const entry of history) if (entry.ok === false) buckets.failed += 1; return { metrics: { actions: history.length, timeline: timeline.length, agents: countAgents(status), ...buckets }, recentActions: history.slice(0, 30).map(compactAction), source: history.length ? "scoped-action-history" : "mission-timeline" }; }
function countAgents(status) { const c = status?.collaboration || status?.mission?.collaboration || status?.status?.collaboration; const agents = c?.agents || c?.room?.agents || c?.participants || []; return Array.isArray(agents) ? agents.length : Object.keys(agents || {}).length; }
function compactAction(entry) { const input = entry.input || {}; return { actionId: entry.actionId, action: entry.action, group: classify(entry), ok: entry.ok !== false, createdAt: entry.createdAt, missionId: entry.missionId || input.missionId || null, conversationId: entry.conversationId || input.conversationId || null, agentSessionId: entry.agentSessionId || input.agentSessionId || null, logicalAgentId: entry.logicalAgentId || input.logicalAgentId || null, path: input.path || input.p || input.cwd || input.url || null, parentActionId: entry.parentActionId || null, outputRef: entry.outputRef || null }; }
function classify(entry = {}) { const action = String(entry.action || ""); if (/^(command|shellCommand|commandRun|commandStart|node|npm|test|build)/.test(action)) return "command"; if (/^(read|write|bulkWrite|move|copy|delete|mkdir|ensureFile|touch|applyPatch|replace)/.test(action)) return "filesystem"; if (/^(chrome|browser|remoteDesktop|http|network)/.test(action)) return "browser"; if (/^mission/.test(action)) return "mission"; return "other"; }
async function ask($i, opts, payload) { try { return await $i.ws.sendTunnelRequest(opts.tunnelName, { targetVessel: "native-tunnel", p: ".", ...payload }); } catch (e) { return { ok: false, error: e.message, action: payload.action }; } }
function options($i) { const p = { ...($i?.paramKinds?.GET || {}), ...($i?.paramKinds?.POST || {}) }; return { tunnelName: String(p.tunnelName || p.tunnel || "auto"), missionId: String(p.missionId || p.room || ""), conversationId: String(p.conversationId || ""), conversationName: String(p.conversationName || ""), agentSessionId: String(p.agentSessionId || ""), logicalAgentId: String(p.logicalAgentId || ""), clientRequestId: String(p.clientRequestId || ""), pollMs: number(p.pollMs, 2500, 700, 30000), historyLimit: number(p.historyLimit || p.limit, 120, 10, 500) }; }
function writeEvent(res, event, data) { res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`); }
function number(value, fallback, min, max) { const n = Number(value); return Number.isFinite(n) ? Math.max(min, Math.min(Math.floor(n), max)) : fallback; }
function packet(ok, extra) { return { BH: "B\"H", ok, ...extra }; }
module.exports = { missionRoomStream, snapshot, summarizeRoomOs, classify, scopedPayload };
