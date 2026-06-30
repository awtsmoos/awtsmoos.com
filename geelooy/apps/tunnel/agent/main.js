// B"H
const { loadConfig, ROOT, HOME } = require('./lib/config.js');
const { makeLogger } = require('./lib/log.js');
const { startLocalApiServer } = require('./lib/local-api.js');
const { openHostedControl } = require('./lib/open.js');
const { TinyWebSocket } = require('./lib/ws.js');
const { handleFs } = require('./tools/fs/index.js');
const { handleCommand } = require('./tools/command/index.js');
const { handleChrome } = require('./tools/chrome/index.js');
const { handleRelay } = require('./tools/relay/index.js');
const { handleStreaming } = require('./tools/streaming/index.js');
const { AGENT_VERSION } = require('./tools/fs/actions.js');
const { inlineLimit } = require('./lib/response-size.js');
const { nativeRegistrationPacket } = require('./lib/registration.js');
const { maybeSelfUpdate, restartIntoUpdatedAgent } = require('./lib/self-update.js');
const L = require('./lib/runtime/limits.js');
const K = require('./lib/runtime/kind.js');
const Mem = require('./lib/runtime/memory.js');
const Env = require('./lib/runtime/envelope.js');
const C = require('./lib/runtime/correlation.js');
const Send = require('./lib/runtime/safe-send.js');
const Proxy = require('./lib/runtime/local-proxy.js');
const Boot = require('./lib/runtime/boot-resume-loop.js');
const Priority = require('./lib/runtime/priority.js');

const log = makeLogger(ROOT);
const state = { activeWs:null, reconnectTimer:null, watchdogTimer:null, reconnectAttempt:0, wasEverConnected:false, generation:0, inflight:new Set(), requestQueue:[] };
function stats(){ return { inflight:state.inflight.size, queued:state.requestQueue.length, maxInflight:L.MAX_INFLIGHT, maxQueue:L.MAX_QUEUE }; }
function snapshot(){ return Mem.snapshot(state, L, inlineLimit); }
setInterval(() => log('Memory:', JSON.stringify(snapshot())), 60000).unref();

async function registerOrUpdate(ws, gen){
  const config = loadConfig();
  try {
    const u = await maybeSelfUpdate({ config });
    if (u?.updated) { log('Tunnel self-update installed:', JSON.stringify(u)); try { ws.close(true); } catch(_){} restartIntoUpdatedAgent(); process.exit(0); }
    if (u?.wouldUpdate) log('Tunnel self-update dry-run:', JSON.stringify(u));
  } catch(e) { log('Tunnel self-update check failed; continuing current agent:', e && (e.stack || e.message || String(e))); }
  if (gen !== state.generation || !ws || ws.closed) return;
  register(ws);
}

function register(ws){
  const config = loadConfig();
  ws.lastSeenAt = Date.now();
  ws.sendJson(nativeRegistrationPacket({ config, agentVersion:AGENT_VERSION, limits:{ maxInflight:L.MAX_INFLIGHT, strictOrdering:L.STRICT_ORDERING, maxQueue:L.MAX_QUEUE, requestMaxAgeMs:L.REQUEST_MAX_AGE_MS, maxProxyBytes:L.MAX_PROXY_BYTES, reconnectMinMs:L.RECONNECT_MIN_MS, reconnectMaxMs:L.RECONNECT_MAX_MS, watchdogMs:L.WATCHDOG_MS, staleMs:L.WATCHDOG_STALE_MS, inlineLimitBytes:inlineLimit(), priorityActions:[...Priority.PRIORITY_ACTIONS] } }));
  state.wasEverConnected = true;
  state.reconnectAttempt = 0;
  log('Tunnel connected:', config.tunnelName, 'root:', config.root || HOME);
}

function enqueueRequest(ws, data){
  if (state.requestQueue.length >= L.MAX_QUEUE) return Send.safeSend(ws, { type:'TUNNEL_RESPONSE', id:data.id, ...C.fields(data.payload || {}), ok:false, status:429, error:'agent_queue_full', ...stats() });
  Priority.enqueue(state.requestQueue, { ws, data, enqueuedAt:Date.now() });
  drainQueue();
}

function drainQueue(){
  while (state.inflight.size < L.MAX_INFLIGHT && state.requestQueue.length) {
    const item = state.requestQueue.shift();
    if (!item.ws || !item.ws.opened) continue;
    const age = Date.now() - item.enqueuedAt;
    if (age > L.REQUEST_MAX_AGE_MS) {
      Send.safeSend(item.ws, { type:'TUNNEL_RESPONSE', id:item.data.id, ...C.fields(item.data.payload || {}), ok:false, status:504, error:'agent_queue_timeout', queuedMs:age, maxQueuedMs:L.REQUEST_MAX_AGE_MS });
      continue;
    }
    runRequest(item.ws, item.data, item.enqueuedAt);
  }
}

async function runRequest(ws, data, enqueuedAt){
  const token = data.id || Date.now() + '_' + Math.random().toString(36).slice(2);
  state.inflight.add(token);
  try {
    const payload = data.payload || {};
    if (payload.kind === 'local_http_proxy') return Proxy.proxyLocalHttp(loadConfig(), data, ws, Send.safeSend, L.MAX_PROXY_BYTES);
    const kind = K.normalize(payload);
    const result = await dispatch(kind, payload, ws);
    Send.safeSend(ws, Env.responseEnvelope(data, payload, result, enqueuedAt, stats));
  } catch(e) {
    Send.safeSend(ws, { type:'TUNNEL_RESPONSE', id:data.id, ...C.fields(data.payload || {}), ok:false, status:500, error:e.message, stack:e.stack });
  } finally {
    state.inflight.delete(token);
    setImmediate(drainQueue);
  }
}

async function dispatch(kind, payload, ws){
  if (kind === 'fs') return await handleFs({ ...payload, kind }, ws);
  if (kind === 'command') return await handleCommand({ ...payload, kind });
  if (kind === 'chrome') return await handleChrome({ ...payload, kind });
  if (kind === 'relay') return await handleRelay({ ...payload, kind }, loadConfig());
  if (kind === 'streaming') return await handleStreaming({ ...payload, kind });
  return { ok:false, status:400, action:payload.action || 'unknown', error:'unknown_payload_kind', receivedKind:payload.kind, normalizedKind:kind };
}

function reconnectDelayMs(){ const raw = Math.min(L.RECONNECT_MAX_MS, L.RECONNECT_MIN_MS * Math.pow(2, Math.max(0, state.reconnectAttempt - 1))); return Math.min(L.RECONNECT_MAX_MS, raw + Math.floor(Math.random() * Math.max(1, Math.floor(raw * 0.25)))); }
function scheduleReconnect(reason){ clearTimeout(state.reconnectTimer); clearInterval(state.watchdogTimer); state.reconnectAttempt += 1; const delay = state.wasEverConnected ? reconnectDelayMs() : L.RECONNECT_MIN_MS; log('Tunnel reconnect scheduled:', reason || 'unknown', 'delayMs:', delay, JSON.stringify(snapshot())); state.reconnectTimer = setTimeout(connect, delay); state.reconnectTimer.unref?.(); }
function closeActiveSocket(force = true){ if (!state.activeWs) return; try { state.activeWs.removeAllListeners(); } catch(_){} try { state.activeWs.close(force); } catch(_){} state.activeWs = null; }
function startWatchdog(ws, gen){ clearInterval(state.watchdogTimer); state.watchdogTimer = setInterval(() => { if (gen !== state.generation || !ws || ws.closed) return; const staleMs = Date.now() - Number(ws.lastSeenAt || 0); if (ws.opened && staleMs < L.WATCHDOG_STALE_MS) return; log('Tunnel watchdog reconnect:', JSON.stringify({ staleMs, opened:ws.opened, closed:ws.closed })); try { ws.close(true); } catch(_){} if (gen === state.generation) scheduleReconnect('watchdog_stale_socket'); }, L.WATCHDOG_MS); state.watchdogTimer.unref?.(); }
function exitBecauseNewerConnectionOwnsTunnel(){ clearTimeout(state.reconnectTimer); clearInterval(state.watchdogTimer); closeActiveSocket(true); log('Tunnel replaced by newer connection; exiting this older process.'); process.exit(0); }

function connect(){
  state.generation += 1;
  closeActiveSocket(true);
  const gen = state.generation, config = loadConfig(), ws = new TinyWebSocket(config.relay);
  ws.lastSeenAt = Date.now();
  state.activeWs = ws;
  startWatchdog(ws, gen);
  ws.on('open', () => { if (gen === state.generation) registerOrUpdate(ws, gen); });
  ws.on('message', msg => { if (gen !== state.generation) return; ws.lastSeenAt = Date.now(); let data; try { data = JSON.parse(msg); } catch(_) { return; } if (data.type === 'TUNNEL_REPLACED') return exitBecauseNewerConnectionOwnsTunnel(); if (data.type === 'TUNNEL_REQUEST') enqueueRequest(ws, data); });
  ws.once('close', () => { if (gen === state.generation) scheduleReconnect('close'); });
  ws.on('error', err => { if (gen === state.generation) log('Tunnel error:', err.message); });
  ws.connect();
}

function main(){
  const config = loadConfig();
  log('B"H Awtsmoos split agent starting.');
  log('Config root dir:', ROOT);
  log('Tunnel name:', config.tunnelName);
  log('Project root:', config.root || HOME);
  log('Limits:', JSON.stringify({ MAX_INFLIGHT:L.MAX_INFLIGHT, MAX_QUEUE:L.MAX_QUEUE, REQUEST_MAX_AGE_MS:L.REQUEST_MAX_AGE_MS, MAX_PROXY_BYTES:L.MAX_PROXY_BYTES, RECONNECT_MIN_MS:L.RECONNECT_MIN_MS, RECONNECT_MAX_MS:L.RECONNECT_MAX_MS, WATCHDOG_MS:L.WATCHDOG_MS, WATCHDOG_STALE_MS:L.WATCHDOG_STALE_MS, inlineLimitBytes:inlineLimit(), priorityActions:[...Priority.PRIORITY_ACTIONS] }));
  startLocalApiServer({ log });
  Boot.start(log);
  if (process.argv.includes('--open-control')) openHostedControl(config);
  connect();
}

process.on('uncaughtException', err => log('Uncaught exception:', err.stack || err.message));
process.on('unhandledRejection', err => log('Unhandled rejection:', err && (err.stack || err.message || String(err))));
main();
