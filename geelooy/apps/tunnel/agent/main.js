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
const L = require('./lib/runtime/limits.js');
const K = require('./lib/runtime/kind.js');
const Mem = require('./lib/runtime/memory.js');
const Env = require('./lib/runtime/envelope.js');
const C = require('./lib/runtime/correlation.js');
const Send = require('./lib/runtime/safe-send.js');
const Proxy = require('./lib/runtime/local-proxy.js');
const Boot = require('./lib/runtime/boot-resume-loop.js');
const Priority = require('./lib/runtime/priority.js');
const Control = require('./lib/runtime/control-plane.js');
const Updates = require('./lib/runtime/background-update.js');
const Circuit = require('./lib/runtime/circuit-breaker.js');
const { createSupervisor } = require('./lib/runtime/worker-supervisor.js');
const log = makeLogger(ROOT), identity = Control.createRuntimeIdentity(), workers = createSupervisor({ log });
const state = { activeWs:null, reconnectTimer:null, watchdogTimer:null, reconnectAttempt:0, wasEverConnected:false, generation:0, lanes:Priority.makeLaneState(), eventLoopLag:{ lastMs:0, maxMs:0, sampledAt:Date.now() } };
function totalInflight(){ return Priority.inflightCount(state.lanes); }
function totalQueued(){ return Priority.queuedCount(state.lanes); }
function laneStats(){ return Object.fromEntries(Priority.LANE_ORDER.map(l => [l, { inflight:state.lanes[l].inflight, queued:state.lanes[l].queue.length, maxInflight:L.LANE_LIMITS[l], timeoutMs:L.LANE_TIMEOUT_MS[l] }])); }
function stats(){ const lanes = laneStats(); return { inflight:totalInflight(), queued:totalQueued(), maxInflight:L.MAX_INFLIGHT, maxQueue:L.MAX_QUEUE, lanes, eventLoopLag:state.eventLoopLag, circuit:Circuit.snapshot({ lanes, eventLoopLag:state.eventLoopLag }), workers:workers.status() }; }
function snapshot(){ return { ...Mem.snapshot({ inflight:new Set(Array(totalInflight()).fill(0)), requestQueue:Array(totalQueued()).fill(0) }, L, inlineLimit), ...stats() }; }
setInterval(() => log('Memory:', JSON.stringify(snapshot())), 60000).unref();
let expectedLagAt = Date.now() + 2000;
setInterval(() => { const now = Date.now(), lag = Math.max(0, now - expectedLagAt); state.eventLoopLag = { lastMs:lag, maxMs:Math.max(state.eventLoopLag.maxMs || 0, lag), sampledAt:now }; expectedLagAt = now + 2000; }, 2000).unref();
function registerReady(ws, gen){ if (gen !== state.generation || !ws || ws.closed) return; const config = loadConfig(); Control.markSeen(ws); ws.sendJson(nativeRegistrationPacket({ config, agentVersion:AGENT_VERSION, runtime:Control.registrationRuntime(identity, gen), limits:{ maxInflight:L.MAX_INFLIGHT, strictOrdering:L.STRICT_ORDERING, maxQueue:L.MAX_QUEUE, laneLimits:L.LANE_LIMITS, laneTimeoutMs:L.LANE_TIMEOUT_MS, requestMaxAgeMs:L.REQUEST_MAX_AGE_MS, maxProxyBytes:L.MAX_PROXY_BYTES, reconnectMinMs:L.RECONNECT_MIN_MS, reconnectMaxMs:L.RECONNECT_MAX_MS, watchdogMs:L.WATCHDOG_MS, staleMs:L.WATCHDOG_STALE_MS, inlineLimitBytes:inlineLimit(), priorityActions:[...Priority.PRIORITY_ACTIONS], lanes:Priority.LANE_ORDER, circuitBreaker:Circuit.DEFAULTS } })); state.wasEverConnected = true; state.reconnectAttempt = 0; log('Tunnel registered ready:', config.tunnelName, 'root:', config.root || HOME, 'generation:', gen, 'pid:', identity.pid); Updates.scheduleSelfUpdate({ config, log, reason:'post_register_ready' }); }
function enqueueRequest(ws, data){ const item = { ws, data, enqueuedAt:Date.now() }, lane = Priority.laneOf(item), s = stats(), gate = Circuit.canAccept(lane, s); if (!gate.ok) return Send.safeSend(ws, { type:'TUNNEL_RESPONSE', id:data.id, ...C.fields(data.payload || {}), ok:false, lane, ...gate, queueStats:s }); if (totalQueued() >= L.MAX_QUEUE) return Send.safeSend(ws, { type:'TUNNEL_RESPONSE', id:data.id, ...C.fields(data.payload || {}), ok:false, status:429, error:'agent_queue_full', ...s }); Priority.enqueue(state.lanes, item); drainQueue(); }
function nextLane(){ for (const lane of Priority.LANE_ORDER) if (state.lanes[lane].queue.length && state.lanes[lane].inflight < L.LANE_LIMITS[lane] && totalInflight() < L.MAX_INFLIGHT) return lane; return ''; }
function drainQueue(){ for (let lane; (lane = nextLane());) { const item = state.lanes[lane].queue.shift(); if (!item.ws || !item.ws.opened) continue; const age = Date.now() - item.enqueuedAt, s = stats(); if (age > L.REQUEST_MAX_AGE_MS) Send.safeSend(item.ws, { type:'TUNNEL_RESPONSE', id:item.data.id, ...C.fields(item.data.payload || {}), ok:false, status:504, error:'agent_queue_timeout', lane, queuedMs:age, maxQueuedMs:L.REQUEST_MAX_AGE_MS, queueStats:s }); else runRequest(lane, item.ws, item.data, item.enqueuedAt); } }
async function runRequest(lane, ws, data, enqueuedAt){ state.lanes[lane].inflight += 1; let settled = false; const timeoutMs = L.LANE_TIMEOUT_MS[lane] || 300000; const timer = setTimeout(() => { if (settled) return; settled = true; Send.safeSend(ws, { type:'TUNNEL_RESPONSE', id:data.id, ...C.fields(data.payload || {}), ok:false, status:504, error:'agent_lane_timeout', lane, timeoutMs, queueStats:stats() }); release(lane); }, timeoutMs); timer.unref?.(); try { const payload = data.payload || {}; const result = await dispatch(K.normalize(payload), payload, ws, data); if (!settled) { settled = true; clearTimeout(timer); Send.safeSend(ws, Env.responseEnvelope(data, payload, { ...result, lane }, enqueuedAt, stats)); release(lane); } } catch(e) { if (!settled) { settled = true; clearTimeout(timer); Send.safeSend(ws, { type:'TUNNEL_RESPONSE', id:data.id, ...C.fields(data.payload || {}), ok:false, status:500, error:e.message, stack:e.stack, lane }); release(lane); } } }
function release(lane){ state.lanes[lane].inflight = Math.max(0, state.lanes[lane].inflight - 1); setImmediate(drainQueue); }
async function dispatch(kind, payload, ws, data){ if (payload.kind === 'local_http_proxy') return Proxy.proxyLocalHttp(loadConfig(), data, ws, Send.safeSend, L.MAX_PROXY_BYTES); if (kind === 'fs') return await handleFs({ ...payload, kind }, ws); if (kind === 'command') return await handleCommand({ ...payload, kind }); if (kind === 'chrome') return await handleChrome({ ...payload, kind }); if (kind === 'relay') return await handleRelay({ ...payload, kind }, loadConfig()); if (kind === 'streaming') return await handleStreaming({ ...payload, kind }); return { ok:false, status:400, action:payload.action || 'unknown', error:'unknown_payload_kind', receivedKind:payload.kind, normalizedKind:kind }; }
function reconnectDelayMs(){ const raw = Math.min(L.RECONNECT_MAX_MS, L.RECONNECT_MIN_MS * Math.pow(2, Math.max(0, state.reconnectAttempt - 1))); return Math.min(L.RECONNECT_MAX_MS, raw + Math.floor(Math.random() * Math.max(1, Math.floor(raw * 0.25)))); }
function scheduleReconnect(reason){ clearTimeout(state.reconnectTimer); clearInterval(state.watchdogTimer); state.reconnectAttempt += 1; const delay = state.wasEverConnected ? reconnectDelayMs() : L.RECONNECT_MIN_MS; log('Tunnel reconnect scheduled:', reason || 'unknown', 'delayMs:', delay, JSON.stringify(snapshot())); state.reconnectTimer = setTimeout(connect, delay); state.reconnectTimer.unref?.(); }
function closeActiveSocket(force = true){ if (!state.activeWs) return; try { state.activeWs.removeAllListeners(); } catch(_){} try { state.activeWs.close(force); } catch(_){} state.activeWs = null; }
function startWatchdog(ws, gen){ clearInterval(state.watchdogTimer); state.watchdogTimer = setInterval(() => { if (gen !== state.generation || !ws || ws.closed) return; const staleMs = Date.now() - Number(ws.lastSeenAt || 0); if (ws.opened && staleMs < L.WATCHDOG_STALE_MS) return; log('Tunnel watchdog reconnect:', JSON.stringify({ staleMs, opened:ws.opened, closed:ws.closed, gen, ...snapshot() })); try { ws.close(true); } catch(_){} if (gen === state.generation) scheduleReconnect('watchdog_stale_socket'); }, L.WATCHDOG_MS); state.watchdogTimer.unref?.(); }
function exitBecauseNewerConnectionOwnsTunnel(){ clearTimeout(state.reconnectTimer); clearInterval(state.watchdogTimer); closeActiveSocket(true); log('Tunnel replaced by newer connection; exiting this older process.'); process.exit(0); }
function connect(){ const gen = Control.nextGeneration(identity); state.generation = gen; closeActiveSocket(true); const config = loadConfig(), ws = new TinyWebSocket(config.relay); Control.markSeen(ws); state.activeWs = ws; startWatchdog(ws, gen); ws.on('open', () => registerReady(ws, gen)); ws.on('message', msg => { if (gen !== state.generation) return; Control.markSeen(ws); let data; try { data = JSON.parse(msg); } catch(_) { return; } if (data.type === 'TUNNEL_REPLACED') return exitBecauseNewerConnectionOwnsTunnel(); if (data.type === 'TUNNEL_REQUEST') enqueueRequest(ws, data); }); ws.once('close', () => { if (gen === state.generation) scheduleReconnect('close'); }); ws.on('error', err => { if (gen === state.generation) log('Tunnel error:', err.message); }); ws.connect(); }
function main(){ const config = loadConfig(); log('B"H Awtsmoos split agent starting.'); log('Config root dir:', ROOT); log('Tunnel name:', config.tunnelName); log('Project root:', config.root || HOME); log('Limits:', JSON.stringify({ MAX_INFLIGHT:L.MAX_INFLIGHT, MAX_QUEUE:L.MAX_QUEUE, laneLimits:L.LANE_LIMITS, laneTimeoutMs:L.LANE_TIMEOUT_MS, circuitBreaker:Circuit.DEFAULTS, REQUEST_MAX_AGE_MS:L.REQUEST_MAX_AGE_MS, MAX_PROXY_BYTES:L.MAX_PROXY_BYTES, RECONNECT_MIN_MS:L.RECONNECT_MIN_MS, RECONNECT_MAX_MS:L.RECONNECT_MAX_MS, WATCHDOG_MS:L.WATCHDOG_MS, WATCHDOG_STALE_MS:L.WATCHDOG_STALE_MS, inlineLimitBytes:inlineLimit(), priorityActions:[...Priority.PRIORITY_ACTIONS] })); startLocalApiServer({ log }); Boot.start(log); if (process.argv.includes('--open-control')) openHostedControl(config); connect(); }
process.on('uncaughtException', err => log('Uncaught exception:', err.stack || err.message));
process.on('unhandledRejection', err => log('Unhandled rejection:', err && (err.stack || err.message || String(err))));
main();
