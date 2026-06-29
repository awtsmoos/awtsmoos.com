// B"H
const childProcess = require('child_process');
const fsp = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const os = require('os');
const Device = require('./deviceStateRoot.js');
const { safePath } = require('./pathGuard.js');
const DIR = 'command-jobs';
const TTL_MS = 2 * 60 * 60 * 1000;
const DEFAULT_PAGE_CHARS = 12000;
const MAX_PAGE_CHARS = 250000;
const DEFAULT_HTTP_SAFE_WAIT_MS = 25000;
const TORAH_UNLIMITED_WAIT_MS = 24 * 60 * 60 * 1000;
const TERMINAL = new Set(['completed','failed','timed_out','cancelled']);
const JOBS = new Map();
function storeRoot(config = {}) { return path.join(Device.awtsmoosRoot(config), DIR); }
function jobDir(config = {}, jobId = '') { return path.join(storeRoot(config), cleanId(jobId)); }
function jobFile(config, jobId, name) { return path.join(jobDir(config, jobId), name); }
async function startCommandJob(config = {}, payload = {}) {
  if (!allowed(config, payload)) return { ok:false, action:'commandStart', error:'commands_disabled' };
  const command = String(payload.command || payload.script || payload.text || '').trim();
  if (!command) return { ok:false, action:'commandStart', error:'missing_command' };
  await ensure(config);
  const jobId = `cmdjob_${Date.now().toString(36)}_${crypto.randomBytes(6).toString('hex')}`;
  const cwd = resolveCwd(config, payload), shell = payload.shell || defaultShell(), timeoutMs = boundedTimeout(payload.timeoutMs || 86400000);
  await fsp.mkdir(jobDir(config, jobId), { recursive:true });
  await fsp.writeFile(jobFile(config, jobId, 'stdout.txt'), '', 'utf8');
  await fsp.writeFile(jobFile(config, jobId, 'stderr.txt'), '', 'utf8');
  const meta = { BH:'B"H', jobId, action:'commandStart', command, cwd, shell, startedAt:new Date().toISOString(), status:'running', exitCode:null, signal:null, timedOut:false, stdoutChars:0, stderrChars:0, timeoutMs, storage:{ backend:'device-file', outsideProject:true, folder:jobDir(config, jobId) } };
  await writeMeta(config, jobId, meta);
  const child = childProcess.spawn(command, { cwd, shell, windowsHide:true, detached:false });
  const live = { child, meta, writes:[], chains:{ stdout:Promise.resolve(), stderr:Promise.resolve() } };
  const timer = setTimeout(() => { meta.timedOut = true; killChild(child); }, timeoutMs);
  JOBS.set(jobId, live);
  child.stdout.on('data', c => append(config, jobId, 'stdout', c));
  child.stderr.on('data', c => append(config, jobId, 'stderr', c));
  child.on('error', error => finishJob(config, jobId, meta, { status:'failed', error:error.message, timer }));
  child.on('close', (code, signal) => finishJob(config, jobId, meta, { status: code === 0 ? 'completed' : meta.timedOut ? 'timed_out' : 'failed', exitCode:code, signal, timer }));
  return startResponse(jobId, { command, cwd, shell, timeoutMs, storage: meta.storage });
}
function startResponse(jobId, details) { return { ok:true, action:'commandStart', jobId, status:'running', ...details, statusPayload:{ action:'commandStatus', jobId }, waitPayload:{ action:'commandWait', jobId, waitTimeoutMs:waitCapMs(), pollIntervalMs:1000 }, stdoutPagePayload:{ action:'commandJobOutputPage', jobId, stream:'stdout', offsetChars:0, maxChars:DEFAULT_PAGE_CHARS }, stderrPagePayload:{ action:'commandJobOutputPage', jobId, stream:'stderr', offsetChars:0, maxChars:DEFAULT_PAGE_CHARS }, aiInstructions:'Command is running asynchronously in device-specific .Awtsmoos outside the git repository. Use commandWait/status/output pages.' }; }
async function finishJob(config, jobId, meta, patch = {}) {
  clearTimeout(patch.timer); await waitForWrites(jobId);
  const current = await readMeta(config, jobId); const base = current && TERMINAL.has(current.status) ? current : meta;
  const finalMeta = { ...base, ...patch, finishedAt:base.finishedAt || new Date().toISOString() }; delete finalMeta.timer;
  await refreshCounts(config, jobId, finalMeta); await writeMeta(config, jobId, finalMeta); JOBS.delete(jobId); return finalMeta;
}
async function commandStatus(config = {}, payload = {}) {
  const jobId = cleanId(payload.jobId || payload.id || ''); if (!jobId) return { ok:false, action:'commandStatus', error:'missing_jobId', status:'missing_jobId' };
  await waitForWrites(jobId); const meta = await readMeta(config, jobId); if (!meta) return { ok:false, action:'commandStatus', error:'job_not_found_or_expired', status:'missing', jobId };
  await refreshCounts(config, jobId, meta); const live = JOBS.get(jobId); if (live && !TERMINAL.has(meta.status)) { meta.status = live.meta.status || meta.status; meta.timedOut = !!(live.meta.timedOut || meta.timedOut); }
  return statusResponse(jobId, meta, payload);
}
async function commandWait(config = {}, payload = {}) {
  const jobId = cleanId(payload.jobId || payload.id || ''); if (!jobId) return { ok:false, action:'commandWait', error:'missing_jobId', status:'missing_jobId' };
  const capMs = waitCapMs(payload), req = Number(payload.waitTimeoutMs || payload.timeoutMs || capMs), timeoutMs = Math.min(Number.isFinite(req) ? req : capMs, capMs), intervalMs = Math.max(25, Math.min(Number(payload.intervalMs || payload.pollIntervalMs || 1000), 30000));
  const startedAt = Date.now(); let status = null;
  while (Date.now() - startedAt <= timeoutMs) { status = await commandStatus(config, { ...payload, jobId }); if (!status.ok || status.status !== 'running') { await waitForWrites(jobId); const maxChars = payload.maxChars || DEFAULT_PAGE_CHARS; return { ...status, action:'commandWait', done:true, waitedMs:Date.now() - startedAt, stdout: payload.inlineOutput === false ? null : await commandJobOutputPage(config, { jobId, stream:'stdout', maxChars }), stderr: payload.inlineOutput === false ? null : await commandJobOutputPage(config, { jobId, stream:'stderr', maxChars }) }; } await sleep(intervalMs); }
  return { ok:true, action:'commandWait', status: status?.status === 'running' ? 'running' : 'wait_timeout', done:false, waitTimedOut:true, httpSafeWaitMs:capMs, torahUnlimitedWait:torahUnlimitedEnabled(payload), waitedMs:Date.now() - startedAt, lastStatus:status, statusPayload:{ action:'commandStatus', jobId }, nextWaitPayload:{ action:'commandWait', jobId, waitTimeoutMs:capMs, pollIntervalMs:intervalMs } };
}
async function commandJobOutputPage(config = {}, payload = {}) {
  const jobId = cleanId(payload.jobId || payload.id || ''); if (!jobId) return { ok:false, action:'commandJobOutputPage', error:'missing_jobId' };
  const stream = String(payload.stream || 'stdout').toLowerCase() === 'stderr' ? 'stderr' : 'stdout'; await waitForWrites(jobId);
  const meta = await readMeta(config, jobId); if (!meta) return { ok:false, action:'commandJobOutputPage', error:'job_not_found_or_expired', jobId };
  const text = await readText(config, jobId, `${stream}.txt`), offset = Math.max(0, Math.floor(Number(payload.offsetChars || payload.offset || 0))), maxChars = boundedPageChars(payload.maxChars || payload.pageChars || DEFAULT_PAGE_CHARS), content = text.slice(offset, offset + maxChars), nextOffsetChars = offset + content.length < text.length ? offset + content.length : null;
  return { BH:'B"H', ok:true, action:'commandJobOutputPage', jobId, stream, status:meta.status, storage:meta.storage, offsetChars:offset, returnedChars:content.length, totalChars:text.length, content, hasNextPage:nextOffsetChars !== null, nextOffsetChars, nextPagePayload: nextOffsetChars === null ? null : { action:'commandJobOutputPage', jobId, stream, offsetChars:nextOffsetChars, maxChars } };
}
async function cancelCommandJob(config = {}, payload = {}) { const jobId = cleanId(payload.jobId || payload.id || ''); if (!jobId) return { ok:false, action:'commandCancel', error:'missing_jobId' }; const live = JOBS.get(jobId); if (live) { killChild(live.child); live.meta.status = 'cancelled'; live.meta.finishedAt = new Date().toISOString(); await waitForWrites(jobId); await refreshCounts(config, jobId, live.meta); await writeMeta(config, jobId, live.meta); JOBS.delete(jobId); return { ok:true, action:'commandCancel', jobId, cancelled:true }; } const meta = await readMeta(config, jobId); return { ok:true, action:'commandCancel', jobId, cancelled:false, status:meta?.status || 'missing' }; }
async function append(config, jobId, stream, chunk) { const live = JOBS.get(jobId), text = Buffer.isBuffer(chunk) ? chunk.toString('utf8') : String(chunk || ''); if (live) live.meta[`${stream}Chars`] = Number(live.meta[`${stream}Chars`] || 0) + text.length; const write = enqueueStreamWrite(config, jobId, stream, text, live); if (live) { live.writes.push(write); write.finally(() => { live.writes = live.writes.filter(x => x !== write); }); } await write; }
function enqueueStreamWrite(config, jobId, stream, text, live) { const file = jobFile(config, jobId, `${stream}.txt`); if (!live) return fsp.appendFile(file, text, 'utf8').catch(() => {}); const next = (live.chains?.[stream] || Promise.resolve()).then(() => fsp.appendFile(file, text, 'utf8')).catch(() => {}); live.chains[stream] = next.catch(() => {}); return next; }
async function waitForWrites(jobId) { const live = JOBS.get(jobId); if (live?.writes?.length) await Promise.allSettled([...live.writes]); }
async function ensure(config) { await fsp.mkdir(storeRoot(config), { recursive:true }); await garbageCollect(config); }
async function garbageCollect(config) { let entries = []; try { entries = await fsp.readdir(storeRoot(config), { withFileTypes:true }); } catch { return; } const now = Date.now(); for (const e of entries) if (e.isDirectory()) { const st = await fsp.stat(jobFile(config, e.name, 'meta.json')).catch(() => null); if (st && now - st.mtimeMs > TTL_MS) await fsp.rm(jobDir(config, e.name), { recursive:true, force:true }).catch(() => {}); } }
async function refreshCounts(config, jobId, meta) { meta.stdoutChars = (await readText(config, jobId, 'stdout.txt')).length; meta.stderrChars = (await readText(config, jobId, 'stderr.txt')).length; meta.storage ||= { backend:'device-file', outsideProject:true, folder:jobDir(config, jobId) }; return meta; }
async function writeMeta(config, jobId, meta) { const dir = jobDir(config, jobId), tmp = path.join(dir, `meta.${process.pid}.${Date.now()}.${crypto.randomBytes(4).toString('hex')}.tmp`); await fsp.mkdir(dir, { recursive:true }); await fsp.writeFile(tmp, JSON.stringify(meta, null, 2), 'utf8'); await fsp.rename(tmp, jobFile(config, jobId, 'meta.json')); }
async function readMeta(config, jobId) { for (let i = 0; i < 8; i++) { try { return JSON.parse(await fsp.readFile(jobFile(config, jobId, 'meta.json'), 'utf8')); } catch { if (i === 7) return null; await sleep(5 + i * 5); } } return null; }
async function readText(config, jobId, name) { try { return await fsp.readFile(jobFile(config, jobId, name), 'utf8'); } catch { return ''; } }
function statusResponse(jobId, meta, payload = {}) { const maxChars = boundedPageChars(payload.maxChars || DEFAULT_PAGE_CHARS); return { ...meta, ok:true, action:'commandStatus', running:meta.status === 'running', stdoutPagePayload:{ action:'commandJobOutputPage', jobId, stream:'stdout', offsetChars:Math.max(0, Number(payload.stdoutOffsetChars || 0)), maxChars }, stderrPagePayload:{ action:'commandJobOutputPage', jobId, stream:'stderr', offsetChars:Math.max(0, Number(payload.stderrOffsetChars || 0)), maxChars } }; }
function torahUnlimitedEnabled(payload = {}) { const raw = payload.torahUnlimitedWait ?? payload.unlimitedWait ?? process.env.AWTSMOOS_TORAH_UNLIMITED_WAIT ?? process.env.AWTSMOOS_UNLIMITED_WAIT ?? ''; return raw === true || ['1','true','yes','on'].includes(String(raw).toLowerCase()); }
function waitCapMs(payload = {}) { return boundedWaitMs(torahUnlimitedEnabled(payload) ? payload.maxWaitMs || process.env.AWTSMOOS_MAX_WAIT_MS || TORAH_UNLIMITED_WAIT_MS : process.env.AWTSMOOS_HTTP_SAFE_WAIT_MS || DEFAULT_HTTP_SAFE_WAIT_MS); }
function boundedWaitMs(v) { const n = Number(v); return Number.isFinite(n) ? Math.max(100, Math.min(Math.floor(n), TORAH_UNLIMITED_WAIT_MS)) : DEFAULT_HTTP_SAFE_WAIT_MS; }
function killChild(child) { try { child.kill('SIGTERM'); } catch {} }
function allowed(config = {}, payload = {}) { return config.allowCommands === true || payload.allowCommands === true || String(payload.allowCommands).toLowerCase() === 'true'; }
function resolveCwd(config, payload) { try { return safePath(config, payload.cwd || payload.path || payload.p || '.'); } catch { return config.root || process.cwd(); } }
function boundedTimeout(v) { const n = Number(v || 86400000); return Math.max(100, Math.min(Number.isFinite(n) ? n : 120000, 86400000)); }
function boundedPageChars(v) { const n = Number(v || DEFAULT_PAGE_CHARS); return Math.max(1, Math.min(Number.isFinite(n) ? Math.floor(n) : DEFAULT_PAGE_CHARS, MAX_PAGE_CHARS)); }
function defaultShell() { return os.platform() === 'win32' ? process.env.ComSpec || 'cmd.exe' : '/bin/sh'; }
function cleanId(v) { return String(v || '').replace(/[^a-zA-Z0-9_-]/g, ''); }
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
module.exports = { startCommandJob, commandStatus, commandWait, commandJobOutputPage, cancelCommandJob, storeRoot, jobDir };
