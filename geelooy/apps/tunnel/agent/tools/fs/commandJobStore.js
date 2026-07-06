// B"H
const { safePath } = require('./pathGuard.js');
const P = require('./commandJob/policy.js');
const Paths = require('./commandJob/paths.js');
const Meta = require('./commandJob/meta.js');
const GC = require('./commandJob/gc.js');
const IO = require('./commandJob/io.js');
const Proc = require('./commandJob/process.js');
const Res = require('./commandJob/responses.js');
const Ids = require('./commandJob/ids.js');
const MetaFactory = require('./commandJob/metaFactory.js');
const Heartbeat = require('./commandJob/heartbeat.js');
const RegistryBridge = require('./commandJob/registryBridge.js');
const Finalize = require('./commandJob/finalize.js');
const { getGlobalRegistry } = require('../../lib/runtime/worker-supervisor.js');
const JOBS = new Map();
/**
 * B"H
 * Chapter: the lost command returns from the fog. If the websocket dies, the
 * receipt remains; if the registry forgets, the PID is questioned; if the PID is
 * dust, the stale scroll is sealed. No phantom running job may haunt another
 * shliach's request, for the Awtsmoos gives every command its own vessel.
 */
async function startCommandJob(config = {}, payload = {}) {
  if (!allowed(config, payload)) return named(payload, 'commandStart', { ok:false, error:'commands_disabled' });
  const command = String(payload.command || payload.script || payload.text || '').trim();
  if (!command) return named(payload, 'commandStart', { ok:false, error:'missing_command' });
  await GC.collect(config); const ids = Ids.commandIds(), cwd = resolveCwd(config, payload), shell = payload.shell || P.defaultShell(), timeoutMs = P.boundedTimeout(payload.timeoutMs || 86400000);
  await Paths.ensureDir(config, ids.jobId); const meta = MetaFactory.createMeta({ ...ids, command, cwd, shell, timeoutMs, config, payload, ids }); await Meta.write(config, ids.jobId, meta);
  const child = Proc.spawn(command, cwd, shell); Proc.renice(child, payload); MetaFactory.attachPid(meta, child.pid); const live = createLive(config, payload, ids.jobId, child, meta); wireProcess(config, ids.jobId, child, meta, live, timeoutMs);
  return Res.start(ids.jobId, { command, cwd, shell, timeoutMs, storage:meta.storage, meta });
}
async function commandStatus(config = {}, payload = {}) {
  const jobId = P.cleanId(payload.jobId || payload.id || ''); if (!jobId) return named(payload, 'commandStatus', { ok:false, error:'missing_jobId', status:'missing_jobId' });
  let meta = await Meta.read(config, jobId); if (!meta) return named(payload, 'commandStatus', { ok:false, error:'job_not_found_or_expired', status:'missing', jobId });
  meta = await reconcile(config, jobId, meta); return Res.status(jobId, meta, payload);
}
async function commandWait(config = {}, payload = {}) {
  const jobId = P.cleanId(payload.jobId || payload.id || ''); if (!jobId) return named(payload, 'commandWait', { ok:false, error:'missing_jobId', status:'missing_jobId' });
  const startedAt = Date.now(), timeoutMs = Math.min(Number(payload.waitTimeoutMs || payload.timeoutMs || P.waitCapMs()), P.waitCapMs()), intervalMs = Math.max(25, Math.min(Number(payload.pollIntervalMs || 1000), 30000)); let status = null;
  while (Date.now() - startedAt <= timeoutMs) { status = await commandStatus(config, { ...payload, jobId, action:'commandStatus', requestAction:'commandStatus', actualAction:'commandStatus' }); if (!status.ok || !isRunningStatus(status.status)) return waitDone(config, payload, jobId, status, startedAt); await Meta.sleep(intervalMs); }
  return waitStillRunning(payload, jobId, status, startedAt, intervalMs);
}
async function commandJobOutputPage(config = {}, payload = {}) { const jobId = P.cleanId(payload.jobId || payload.id || ''); if (!jobId) return named(payload, 'commandJobOutputPage', { ok:false, error:'missing_jobId' }); const stream = String(payload.stream || 'stdout').toLowerCase() === 'stderr' ? 'stderr' : 'stdout'; await IO.waitForWrites(jobId, JOBS); return Res.page(config, jobId, stream, payload); }
async function cancelCommandJob(config = {}, payload = {}) {
  const jobId = P.cleanId(payload.jobId || payload.id || ''); if (!jobId) return named(payload, 'commandCancel', { ok:false, error:'missing_jobId' }); const live = JOBS.get(jobId);
  if (live) { Proc.kill(live.child); live.meta.status = 'cancelled'; await finishJob(config, jobId, live.meta, { status:'cancelled' }); return named(payload, 'commandCancel', { ok:true, jobId, cancelled:true }); }
  let meta = await Meta.read(config, jobId); if (!meta) return named(payload, 'commandCancel', { ok:true, jobId, cancelled:false, status:'missing' }); const pid = pidOf(meta); if (pidAlive(pid)) killPid(pid); meta = await finalizeDetached(config, jobId, meta, { status:'cancelled', cancelled:true, detachedRecovered:true }); return named(payload, 'commandCancel', { ok:true, jobId, cancelled:true, status:meta.status, detachedRecovered:true });
}
async function reconcile(config, jobId, meta) {
  await refreshCounts(config, jobId, meta); const live = JOBS.get(jobId); if (live && !P.TERMINAL.has(meta.status)) return { ...meta, ...live.meta, stdoutChars:meta.stdoutChars, stderrChars:meta.stderrChars };
  if (!isRunningStatus(meta.status)) return meta;
  const fresh = await Meta.read(config, jobId);
  if (fresh && fresh !== meta) {
    await refreshCounts(config, jobId, fresh);
    if (!isRunningStatus(fresh.status)) return fresh;
    const freshLive = JOBS.get(jobId);
    if (freshLive && !P.TERMINAL.has(fresh.status)) return { ...fresh, ...freshLive.meta, stdoutChars:fresh.stdoutChars, stderrChars:fresh.stderrChars };
    meta = fresh;
  }
  const pid = pidOf(meta); if (pidAlive(pid)) return markDetached(meta, pid);
  return finalizeDetached(config, jobId, meta, { status:'stale_lost_worker', staleRecovered:true, detachedPid:pid || null, error:meta.error || 'running_receipt_had_no_live_worker_or_live_pid' });
}
function createLive(config, payload, jobId, child, meta) { const registry = getGlobalRegistry(); registry.registerWorker(RegistryBridge.registryRecord(meta, child.pid)); const live = { child, meta, writes:[], chains:{ stdout:Promise.resolve(), stderr:Promise.resolve() }, registry, heartbeatWrites:0 }; JOBS.set(jobId, live); Heartbeat.startHeartbeat({ config, jobId, live, Meta, payload }); return live; }
function wireProcess(config, jobId, child, meta, live, timeoutMs) { const timer = setTimeout(() => { meta.timedOut = true; Proc.kill(child); }, timeoutMs); child.stdout.on('data', c => { Heartbeat.touch(live); IO.append(config, jobId, 'stdout', c, live); }); child.stderr.on('data', c => { Heartbeat.touch(live); IO.append(config, jobId, 'stderr', c, live); }); child.on('error', e => finishJob(config, jobId, meta, { status:'failed', error:e.message, timer })); child.on('close', (code, signal) => finishJob(config, jobId, meta, { status:closeStatus(meta, code), exitCode:code, signal, timer })); }
async function finishJob(config, jobId, meta, patch = {}) { clearTimeout(patch.timer); const live = JOBS.get(jobId); Heartbeat.stop(live); await IO.waitForWrites(jobId, JOBS); const current = await Meta.read(config, jobId), base = current && P.TERMINAL.has(current.status) ? current : meta; const finalMeta = await refreshCounts(config, jobId, Finalize.finalizeMeta({ ...base, ...patch, finishedAt:base.finishedAt || new Date().toISOString() })); delete finalMeta.timer; await Meta.write(config, jobId, finalMeta); RegistryBridge.finishRegistry(live?.registry, finalMeta); JOBS.delete(jobId); GC.collect(config).catch(() => {}); return finalMeta; }
async function finalizeDetached(config, jobId, meta, patch) { const finalMeta = await refreshCounts(config, jobId, Finalize.finalizeMeta({ ...meta, ...patch, finishedAt:meta.finishedAt || new Date().toISOString(), worker:{ ...(meta.worker || {}), state:patch.status, detached:true }, receipt:{ ...(meta.receipt || {}), state:patch.status, updatedAt:new Date().toISOString() } })); await Meta.write(config, jobId, finalMeta); return finalMeta; }
function markDetached(meta, pid) { return { ...meta, status:'detached_running', detachedRunning:true, worker:{ ...(meta.worker || {}), pid, state:'detached_running', detached:true, heartbeatAt:meta.heartbeatAt || meta.updatedAt || meta.startedAt }, receipt:{ ...(meta.receipt || {}), state:'detached_running', updatedAt:new Date().toISOString() } }; }
async function waitDone(config, payload, jobId, status, startedAt) { await IO.waitForWrites(jobId, JOBS); const maxChars = P.boundedPageChars(payload.maxChars || P.DEFAULT_PAGE_CHARS), stdout = payload.inlineOutput === true ? await commandJobOutputPage(config, { jobId, stream:'stdout', maxChars }) : null, stderr = payload.inlineOutput === true ? await commandJobOutputPage(config, { jobId, stream:'stderr', maxChars }) : null; return named(payload, 'commandWait', { ...status, done:true, waitedMs:Date.now() - startedAt, stdout, stderr }); }
async function refreshCounts(config, jobId, meta) { meta.stdoutChars = (await Paths.readText(config, jobId, 'stdout.txt')).length; meta.stderrChars = (await Paths.readText(config, jobId, 'stderr.txt')).length; meta.storage ||= { backend:'device-file', outsideProject:true, folder:Paths.jobDir(config, jobId) }; return meta; }
function waitStillRunning(payload, jobId, status, startedAt, intervalMs) { return named(payload, 'commandWait', { ok:true, status:status?.status || 'running', done:false, waitTimedOut:true, waitedMs:Date.now() - startedAt, lastStatus:status, statusPayload:{ action:'commandStatus', jobId }, nextWaitPayload:{ action:'commandWait', jobId, waitTimeoutMs:P.waitCapMs(), pollIntervalMs:intervalMs, inlineOutput:false } }); }
function named(payload, fallback, body) { const action = String(payload.requestAction || payload.action || fallback); return { ...body, action, requestAction:action, actualAction:action }; }
function pidOf(meta = {}) { const n = Number(meta.pid || meta.worker?.pid || meta.process?.pid || 0); return Number.isInteger(n) && n > 0 ? n : 0; }
function pidAlive(pid) { if (!pid) return false; try { process.kill(pid, 0); return true; } catch { return false; } }
function killPid(pid) { try { process.kill(pid, 'SIGTERM'); } catch {} }
function isRunningStatus(status) { return status === 'running' || status === 'detached_running'; }
function closeStatus(meta, code) { return meta.status === 'cancelled' ? 'cancelled' : code === 0 ? 'completed' : meta.timedOut ? 'timed_out' : 'failed'; }
function allowed(config = {}, payload = {}) { return config.allowCommands === true || payload.allowCommands === true || String(payload.allowCommands).toLowerCase() === 'true'; }
function resolveCwd(config, payload) { try { return safePath(config, payload.cwd || payload.path || payload.p || '.'); } catch { return config.root || process.cwd(); } }
module.exports = { startCommandJob, commandStatus, commandWait, commandJobOutputPage, cancelCommandJob, storeRoot:Paths.storeRoot, jobDir:Paths.jobDir };
