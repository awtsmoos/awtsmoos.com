// B"H
const childProcess = require('child_process');

/**
 * B"H
 * Chapter 1902: Every heavy task received its own small body.
 *
 * Same connected agent, separate subprocess per async task. If the child burns,
 * the kernel remains a witness instead of becoming the flame.
 */
function spawnAsyncTask(options = {}) {
  const command = options.command || process.execPath;
  const args = Array.isArray(options.args) ? options.args : [];
  const cwd = options.cwd || process.cwd();
  const env = { ...process.env, ...(options.env || {}) };
  const timeoutMs = Number(options.timeoutMs || 300000);
  const child = childProcess.spawn(command, args, { cwd, env, detached:process.platform !== 'win32', stdio:options.stdio || ['ignore', 'pipe', 'pipe'], windowsHide:true });
  const task = { pid:child.pid, command, args, cwd, startedAt:Date.now(), status:'running', stdout:'', stderr:'', exitCode:null, signal:null };
  const timer = setTimeout(() => killTask(task, child, 'timeout'), timeoutMs);
  timer.unref?.();
  child.stdout?.on('data', chunk => { task.stdout += chunk.toString(); trim(task, 'stdout', options.maxOutput || 200000); });
  child.stderr?.on('data', chunk => { task.stderr += chunk.toString(); trim(task, 'stderr', options.maxOutput || 200000); });
  child.on('exit', (code, signal) => {
    clearTimeout(timer);
    task.status = code === 0 && !signal ? 'completed' : 'failed';
    task.exitCode = code;
    task.signal = signal;
    task.finishedAt = Date.now();
  });
  child.on('error', err => { clearTimeout(timer); task.status = 'error'; task.error = err.message; task.finishedAt = Date.now(); });
  return { task, child, cancel:reason => killTask(task, child, reason || 'cancelled') };
}
function trim(task, key, max) { if (task[key].length > max) task[key] = task[key].slice(-max); }
function killTask(task, child, reason) {
  task.status = reason || 'killed';
  task.finishedAt = Date.now();
  try { if (process.platform !== 'win32' && child.pid) process.kill(-child.pid, 'SIGTERM'); else child.kill('SIGTERM'); } catch (_) {}
  setTimeout(() => { try { if (process.platform !== 'win32' && child.pid) process.kill(-child.pid, 'SIGKILL'); else child.kill('SIGKILL'); } catch (_) {} }, 3000).unref?.();
  return task;
}
module.exports = { killTask, spawnAsyncTask };
