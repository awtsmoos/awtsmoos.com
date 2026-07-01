// B"H
const crypto = require('crypto');
const { safePath } = require('./pathGuard.js');
const P = require('./commandJob/policy.js');
const Paths = require('./commandJob/paths.js');
const Meta = require('./commandJob/meta.js');
const GC = require('./commandJob/gc.js');
const IO = require('./commandJob/io.js');
const Proc = require('./commandJob/process.js');
const Res = require('./commandJob/responses.js');
const JOBS = new Map();
async function startCommandJob(config = {}, payload = {}) {
  if (!allowed(config, payload)) return { ok:false, action:'commandStart', error:'commands_disabled' };
  const command = String(payload.command || payload.script || payload.text || '').trim();
  if (!command) return { ok:false, action:'commandStart', error:'missing_command' };
  await GC.collect(config);
  const jobId = `cmdjob_${Date.now().toString(36)}_${crypto.randomBytes(6).toString('hex')}`;
  const cwd = resolveCwd(config, payload), shell = payload.shell || P.defaultShell(), timeoutMs = P.boundedTimeout(payload.timeoutMs || 86400000);
  await Paths.ensureDir(config, jobId); await Meta.write(config, jobId, metaFor(jobId, command, cwd, shell, timeoutMs, config));
  const meta = await Meta.read(config, jobId), child = Proc.spawn(command, cwd, shell);
  Proc.renice(child, payload);
  const live = { child, meta, writes:[], chains:{ stdout:Promise.resolve(), stderr:Promise.resolve() } }, timer = setTimeout(() => { meta.timedOut = true; Proc.kill(child); }, timeoutMs);
  JOBS.set(jobId, live);
  child.stdout.on('data', c => IO.append(config, jobId, 'stdout', c, live));
  child.stderr.on('data', c => IO.append(config, jobId, 'stderr', c, live));
  child.on('error', e => finishJob(config, jobId, meta, { status:'failed', error:e.message, timer }));
  child.on('close', (code, signal) => finishJob(config, jobId, meta, { status: code === 0 ? 'completed' : meta.timedOut ? 'timed_out' : 'failed', exitCode:code, signal, timer }));
  return Res.start(jobId, { command, cwd, shell, timeoutMs, storage: meta.storage });
}
async function finishJob(config, jobId, meta, patch = {}) {
  clearTimeout(patch.timer); await IO.waitForWrites(jobId, JOBS);
  const current = await Meta.read(config, jobId); const base = current && P.TERMINAL.has(current.status) ? current : meta;
  const finalMeta = await refreshCounts(config, jobId, { ...base, ...patch, finishedAt:base.finishedAt || new Date().toISOString() });
  delete finalMeta.timer; await Meta.write(config, jobId, finalMeta); JOBS.delete(jobId); GC.collect(config).catch(() => {}); return finalMeta;
}
async function commandStatus(config = {}, payload = {}) {
  const jobId = P.cleanId(payload.jobId || payload.id || ''); if (!jobId) return { ok:false, action:'commandStatus', error:'missing_jobId', status:'missing_jobId' };
  const meta = await Meta.read(config, jobId); if (!meta) return { ok:false, action:'commandStatus', error:'job_not_found_or_expired', status:'missing', jobId };
  await refreshCounts(config, jobId, meta); const live = JOBS.get(jobId); if (live && !P.TERMINAL.has(meta.status)) meta.status = live.meta.status || meta.status;
  return Res.status(jobId, meta, payload);
}
async function commandWait(config = {}, payload = {}) {
  const jobId = P.cleanId(payload.jobId || payload.id || ''); if (!jobId) return { ok:false, action:'commandWait', error:'missing_jobId', status:'missing_jobId' };
  const startedAt = Date.now(), timeoutMs = Math.min(Number(payload.waitTimeoutMs || payload.timeoutMs || P.waitCapMs()), P.waitCapMs()), intervalMs = Math.max(25, Math.min(Number(payload.pollIntervalMs || 1000), 30000));
  let status = null; while (Date.now() - startedAt <= timeoutMs) { status = await commandStatus(config, { ...payload, jobId }); if (!status.ok || status.status !== 'running') return await waitDone(config, payload, jobId, status, startedAt); await Meta.sleep(intervalMs); }
  return { ok:true, action:'commandWait', status:'running', done:false, waitTimedOut:true, waitedMs:Date.now() - startedAt, lastStatus:status, statusPayload:{ action:'commandStatus', jobId }, nextWaitPayload:{ action:'commandWait', jobId, waitTimeoutMs:P.waitCapMs(), pollIntervalMs:intervalMs, inlineOutput:false } };
}
async function waitDone(config, payload, jobId, status, startedAt) {
  await IO.waitForWrites(jobId, JOBS); const maxChars = P.boundedPageChars(payload.maxChars || P.DEFAULT_PAGE_CHARS);
  return { ...status, action:'commandWait', done:true, waitedMs:Date.now() - startedAt, stdout:payload.inlineOutput === true ? await commandJobOutputPage(config, { jobId, stream:'stdout', maxChars }) : null, stderr:payload.inlineOutput === true ? await commandJobOutputPage(config, { jobId, stream:'stderr', maxChars }) : null };
}
async function commandJobOutputPage(config = {}, payload = {}) { const jobId = P.cleanId(payload.jobId || payload.id || ''); if (!jobId) return { ok:false, action:'commandJobOutputPage', error:'missing_jobId' }; const stream = String(payload.stream || 'stdout').toLowerCase() === 'stderr' ? 'stderr' : 'stdout'; await IO.waitForWrites(jobId, JOBS); return Res.page(config, jobId, stream, payload); }
async function cancelCommandJob(config = {}, payload = {}) { const jobId = P.cleanId(payload.jobId || payload.id || ''); if (!jobId) return { ok:false, action:'commandCancel', error:'missing_jobId' }; const live = JOBS.get(jobId); if (live) { Proc.kill(live.child); live.meta.status = 'cancelled'; await finishJob(config, jobId, live.meta, { status:'cancelled' }); return { ok:true, action:'commandCancel', jobId, cancelled:true }; } return { ok:true, action:'commandCancel', jobId, cancelled:false, status:(await Meta.read(config, jobId))?.status || 'missing' }; }
async function refreshCounts(config, jobId, meta) { meta.stdoutChars = (await Paths.readText(config, jobId, 'stdout.txt')).length; meta.stderrChars = (await Paths.readText(config, jobId, 'stderr.txt')).length; meta.storage ||= { backend:'device-file', outsideProject:true, folder:Paths.jobDir(config, jobId) }; return meta; }
function metaFor(jobId, command, cwd, shell, timeoutMs, config) { return { BH:'B"H', jobId, action:'commandStart', command, cwd, shell, startedAt:new Date().toISOString(), status:'running', exitCode:null, signal:null, timedOut:false, stdoutChars:0, stderrChars:0, timeoutMs, storage:{ backend:'device-file', outsideProject:true, folder:Paths.jobDir(config, jobId) } }; }
function allowed(config = {}, payload = {}) { return config.allowCommands === true || payload.allowCommands === true || String(payload.allowCommands).toLowerCase() === 'true'; }
function resolveCwd(config, payload) { try { return safePath(config, payload.cwd || payload.path || payload.p || '.'); } catch { return config.root || process.cwd(); } }
module.exports = { startCommandJob, commandStatus, commandWait, commandJobOutputPage, cancelCommandJob, storeRoot:Paths.storeRoot, jobDir:Paths.jobDir };
