// B"H
const childProcess = require('child_process');

/**
 * B"H
 * Chapter 1502: Around the kernel stood servants with their own breath.
 *
 * This supervisor is deliberately small: it records and restarts child worker
 * vessels without letting their crash become the tunnel's crash. Later lane
 * handlers can move behind these children one by one.
 */
function createSupervisor(options = {}) {
  const workers = new Map();
  const log = typeof options.log === 'function' ? options.log : () => {};
  function define(name, spec = {}) {
    const current = workers.get(name) || { name, restartCount:0, status:'defined' };
    workers.set(name, { ...current, spec:{ ...spec }, name });
    return workers.get(name);
  }
  function start(name) {
    const rec = workers.get(name);
    if (!rec) throw new Error(`unknown_worker:${name}`);
    if (rec.child && !rec.child.killed) return rec;
    const args = Array.isArray(rec.spec.args) ? rec.spec.args : [];
    const child = childProcess.fork(rec.spec.modulePath, args, { stdio:['ignore','ignore','ignore','ipc'], env:{ ...process.env, ...(rec.spec.env || {}), AWTSMOOS_WORKER_NAME:name } });
    rec.child = child;
    rec.pid = child.pid;
    rec.status = 'running';
    rec.startedAt = Date.now();
    rec.lastSeenAt = Date.now();
    child.on('message', msg => { rec.lastSeenAt = Date.now(); rec.lastMessage = msg; });
    child.on('exit', (code, signal) => { rec.status = 'exited'; rec.exitCode = code; rec.signal = signal; rec.exitedAt = Date.now(); rec.child = null; if (rec.spec.restart !== false) scheduleRestart(name, rec); });
    child.on('error', err => { rec.status = 'error'; rec.error = err.message; log('worker error', name, err.message); });
    return rec;
  }
  function scheduleRestart(name, rec) {
    if (rec.restartTimer) return;
    rec.restartCount = Number(rec.restartCount || 0) + 1;
    const delay = Math.min(30000, 500 * rec.restartCount);
    rec.restartTimer = setTimeout(() => { rec.restartTimer = null; try { start(name); } catch (e) { log('worker restart failed', name, e.message); } }, delay);
    rec.restartTimer.unref?.();
  }
  function stop(name) {
    const rec = workers.get(name);
    if (!rec?.child) return rec;
    rec.spec.restart = false;
    try { rec.child.kill('SIGTERM'); } catch (_) {}
    return rec;
  }
  function status() {
    return Object.fromEntries([...workers.entries()].map(([name, rec]) => [name, publicRec(rec)]));
  }
  function publicRec(rec = {}) {
    return { name:rec.name, status:rec.status, pid:rec.pid || null, restartCount:rec.restartCount || 0, startedAt:rec.startedAt || null, lastSeenAt:rec.lastSeenAt || null, exitCode:rec.exitCode ?? null, signal:rec.signal || null, error:rec.error || null };
  }
  return { define, start, stop, status };
}
module.exports = { createSupervisor };
