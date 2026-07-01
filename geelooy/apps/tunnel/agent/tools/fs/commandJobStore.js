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

/** Start a command as an isolated, globally visible worker. */
async function startCommandJob(config = {}, payload = {}) {
  if (!allowed(config, payload)) return { ok: false, action: 'commandStart', error: 'commands_disabled' };
  const command = String(payload.command || payload.script || payload.text || '').trim();
  if (!command) return { ok: false, action: 'commandStart', error: 'missing_command' };
  await GC.collect(config);
  const ids = Ids.commandIds();
  const cwd = resolveCwd(config, payload);
  const shell = payload.shell || P.defaultShell();
  const timeoutMs = P.boundedTimeout(payload.timeoutMs || 86400000);
  await Paths.ensureDir(config, ids.jobId);
  const meta = MetaFactory.createMeta({ ...ids, command, cwd, shell, timeoutMs, config, payload, ids });
  await Meta.write(config, ids.jobId, meta);
  const child = Proc.spawn(command, cwd, shell);
  Proc.renice(child, payload);
  MetaFactory.attachPid(meta, child.pid);
  const live = createLive(config, payload, ids.jobId, child, meta);
  wireProcess(config, ids.jobId, child, meta, live, timeoutMs);
  return Res.start(ids.jobId, { command, cwd, shell, timeoutMs, storage: meta.storage, meta });
}

async function commandStatus(config = {}, payload = {}) {
  const jobId = P.cleanId(payload.jobId || payload.id || '');
  if (!jobId) return { ok: false, action: 'commandStatus', error: 'missing_jobId', status: 'missing_jobId' };
  let meta = await Meta.read(config, jobId);
  if (!meta) return { ok: false, action: 'commandStatus', error: 'job_not_found_or_expired', status: 'missing', jobId };
  await refreshCounts(config, jobId, meta);
  const live = JOBS.get(jobId);
  if (live && !P.TERMINAL.has(meta.status)) meta = { ...meta, ...live.meta, stdoutChars: meta.stdoutChars, stderrChars: meta.stderrChars };
  return Res.status(jobId, meta, payload);
}

async function commandWait(config = {}, payload = {}) {
  const jobId = P.cleanId(payload.jobId || payload.id || '');
  if (!jobId) return { ok: false, action: 'commandWait', error: 'missing_jobId', status: 'missing_jobId' };
  const startedAt = Date.now();
  const timeoutMs = Math.min(Number(payload.waitTimeoutMs || payload.timeoutMs || P.waitCapMs()), P.waitCapMs());
  const intervalMs = Math.max(25, Math.min(Number(payload.pollIntervalMs || 1000), 30000));
  let status = null;
  while (Date.now() - startedAt <= timeoutMs) {
    status = await commandStatus(config, { ...payload, jobId });
    if (!status.ok || status.status !== 'running') return await waitDone(config, payload, jobId, status, startedAt);
    await Meta.sleep(intervalMs);
  }
  return waitStillRunning(jobId, status, startedAt, intervalMs);
}

async function commandJobOutputPage(config = {}, payload = {}) {
  const jobId = P.cleanId(payload.jobId || payload.id || '');
  if (!jobId) return { ok: false, action: 'commandJobOutputPage', error: 'missing_jobId' };
  const stream = String(payload.stream || 'stdout').toLowerCase() === 'stderr' ? 'stderr' : 'stdout';
  await IO.waitForWrites(jobId, JOBS);
  return Res.page(config, jobId, stream, payload);
}

async function cancelCommandJob(config = {}, payload = {}) {
  const jobId = P.cleanId(payload.jobId || payload.id || '');
  if (!jobId) return { ok: false, action: 'commandCancel', error: 'missing_jobId' };
  const live = JOBS.get(jobId);
  if (!live) return { ok: true, action: 'commandCancel', jobId, cancelled: false, status: (await Meta.read(config, jobId))?.status || 'missing' };
  Proc.kill(live.child);
  live.meta.status = 'cancelled';
  await finishJob(config, jobId, live.meta, { status: 'cancelled' });
  return { ok: true, action: 'commandCancel', jobId, cancelled: true };
}

function createLive(config, payload, jobId, child, meta) {
  const registry = getGlobalRegistry();
  registry.registerWorker(RegistryBridge.registryRecord(meta, child.pid));
  const live = { child, meta, writes: [], chains: { stdout: Promise.resolve(), stderr: Promise.resolve() }, registry, heartbeatWrites: 0 };
  JOBS.set(jobId, live);
  Heartbeat.startHeartbeat({ config, jobId, live, Meta, payload });
  return live;
}

function wireProcess(config, jobId, child, meta, live, timeoutMs) {
  const timer = setTimeout(() => { meta.timedOut = true; Proc.kill(child); }, timeoutMs);
  child.stdout.on('data', chunk => { Heartbeat.touch(live); IO.append(config, jobId, 'stdout', chunk, live); });
  child.stderr.on('data', chunk => { Heartbeat.touch(live); IO.append(config, jobId, 'stderr', chunk, live); });
  child.on('error', error => finishJob(config, jobId, meta, { status: 'failed', error: error.message, timer }));
  child.on('close', (code, signal) => finishJob(config, jobId, meta, { status: closeStatus(meta, code), exitCode: code, signal, timer }));
}

async function finishJob(config, jobId, meta, patch = {}) {
  clearTimeout(patch.timer);
  const live = JOBS.get(jobId);
  Heartbeat.stop(live);
  await IO.waitForWrites(jobId, JOBS);
  const current = await Meta.read(config, jobId);
  const base = current && P.TERMINAL.has(current.status) ? current : meta;
  const finalMeta = await refreshCounts(config, jobId, Finalize.finalizeMeta({ ...base, ...patch, finishedAt: base.finishedAt || new Date().toISOString() }));
  delete finalMeta.timer;
  await Meta.write(config, jobId, finalMeta);
  RegistryBridge.finishRegistry(live?.registry, finalMeta);
  JOBS.delete(jobId);
  GC.collect(config).catch(() => {});
  return finalMeta;
}

async function waitDone(config, payload, jobId, status, startedAt) {
  await IO.waitForWrites(jobId, JOBS);
  const maxChars = P.boundedPageChars(payload.maxChars || P.DEFAULT_PAGE_CHARS);
  return { ...status, action: 'commandWait', done: true, waitedMs: Date.now() - startedAt, stdout: payload.inlineOutput === true ? await commandJobOutputPage(config, { jobId, stream: 'stdout', maxChars }) : null, stderr: payload.inlineOutput === true ? await commandJobOutputPage(config, { jobId, stream: 'stderr', maxChars }) : null };
}

async function refreshCounts(config, jobId, meta) {
  meta.stdoutChars = (await Paths.readText(config, jobId, 'stdout.txt')).length;
  meta.stderrChars = (await Paths.readText(config, jobId, 'stderr.txt')).length;
  meta.storage ||= { backend: 'device-file', outsideProject: true, folder: Paths.jobDir(config, jobId) };
  return meta;
}

function waitStillRunning(jobId, status, startedAt, intervalMs) { return { ok: true, action: 'commandWait', status: 'running', done: false, waitTimedOut: true, waitedMs: Date.now() - startedAt, lastStatus: status, statusPayload: { action: 'commandStatus', jobId }, nextWaitPayload: { action: 'commandWait', jobId, waitTimeoutMs: P.waitCapMs(), pollIntervalMs: intervalMs, inlineOutput: false } }; }
function closeStatus(meta, code) { return meta.status === 'cancelled' ? 'cancelled' : code === 0 ? 'completed' : meta.timedOut ? 'timed_out' : 'failed'; }
function allowed(config = {}, payload = {}) { return config.allowCommands === true || payload.allowCommands === true || String(payload.allowCommands).toLowerCase() === 'true'; }
function resolveCwd(config, payload) { try { return safePath(config, payload.cwd || payload.path || payload.p || '.'); } catch { return config.root || process.cwd(); } }

module.exports = { startCommandJob, commandStatus, commandWait, commandJobOutputPage, cancelCommandJob, storeRoot: Paths.storeRoot, jobDir: Paths.jobDir };
