// B"H
const childProcess = require('child_process');
function kill(child) { try { child.kill('SIGTERM'); } catch {} }
function renice(child, payload = {}) {
  if (process.platform === 'win32' || !child?.pid || payload.nice === false || payload.renice === false) return;
  const nice = Math.max(0, Math.min(20, Number(payload.nice ?? process.env.AWTSMOOS_COMMAND_NICE ?? 10)));
  if (!Number.isFinite(nice) || nice <= 0) return;
  try { const r = childProcess.spawn('renice', ['-n', String(Math.floor(nice)), '-p', String(child.pid)], { stdio:'ignore', windowsHide:true }); r.on('error', () => {}); r.unref?.(); } catch {}
}
function spawn(command, cwd, shell) { return childProcess.spawn(command, { cwd, shell, windowsHide:true, detached:false }); }
module.exports = { kill, renice, spawn };
