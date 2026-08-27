// B"H
const fsp = require('fs/promises');
const path = require('path');
const Shell = require('./shell.js');
async function run(config, session, line = '') {
  const [cmd, ...rest] = String(line).trim().split(/\s+/); const arg = rest.join(' ');
  if (!cmd || cmd === 'pwd') return text(session.cwd || '/');
  if (cmd === 'help') return text(Shell.help());
  if (cmd === 'mounts') return json(Shell.mounts(config));
  if (cmd === 'cd') { const r = Shell.resolve(config, session.cwd, arg || '/'); if (r.error) return err(r.error); session.cwd = r.virtual; return text(session.cwd); }
  if (cmd === 'ls') return await list(config, session, arg || '.');
  if (cmd === 'cat') return await cat(config, session, arg);
  if (cmd === 'preview') return json({ action:'sharePreviewFile', path:toLocal(config, session, arg).relative, ttlSeconds:1800 });
  if (cmd === 'jobs') return json({ hint:'Use commandJobStatus/commandJobOutputPage through tunnel actions.' });
  return err('unsupported_fake_ssh_command');
}
function toLocal(config, session, target) { const r = Shell.resolve(config, session.cwd, target); if (r.error) throw new Error(r.error); return { full:path.resolve(config.root, r.real), relative:path.relative(config.root, path.resolve(config.root, r.real)).replace(/\\/g,'/') || '.' }; }
async function list(config, s, target) { try { const p = toLocal(config, s, target); const xs = await fsp.readdir(p.full, { withFileTypes:true }); return text(xs.map(x => x.name + (x.isDirectory() ? '/' : '')).join('\n')); } catch(e) { return err(e.message); } }
async function cat(config, s, target) { try { return text(await fsp.readFile(toLocal(config, s, target).full, 'utf8')); } catch(e) { return err(e.message); } }
function text(stdout) { return { ok:true, stdout:String(stdout || ''), stderr:'', code:0 }; }
function json(v) { return text(JSON.stringify(v, null, 2)); }
function err(stderr) { return { ok:false, stdout:'', stderr:String(stderr), code:1 }; }
module.exports = { run };
