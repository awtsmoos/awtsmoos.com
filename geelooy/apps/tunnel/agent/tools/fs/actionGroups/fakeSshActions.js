// B"H
const fsp = require('fs/promises');
const Shell = require('../../../lib/fakeSsh/shell.js');
const { safePath, rel, assertNotSecret } = require('../pathGuard.js');
function buildFakeSshActions(ctx) { const { config, payload = {} } = ctx; return {
  async fakeSshMounts() { return { ok:true, action:'fakeSshMounts', mounts:Shell.mounts(config), prompt:Shell.prompt(payload.cwd || '/') }; },
  async fakeSshResolve() { return { ok:true, action:'fakeSshResolve', resolved:Shell.resolve(config, payload.cwd || '/', payload.path || payload.p || '.') }; },
  async fakeSshHelp() { return { ok:true, action:'fakeSshHelp', help:Shell.help() }; },
  async fakeSshRead() { const r = Shell.resolve(config, payload.cwd || '/', payload.path || payload.p || '.'); if (r.error) return { ok:false, action:'fakeSshRead', error:r.error, virtual:r.virtual }; const full = safePath(config, r.real); assertNotSecret(config, full); return { ok:true, action:'fakeSshRead', virtual:r.virtual, path:rel(config, full), content:await fsp.readFile(full, 'utf8') }; }
};}
/**
 * B"H
 * This is not yet a network daemon; it is the command grammar and VFS adapter
 * for an SSH client that will believe Geelooy OS is a real machine.
 */
module.exports = { buildFakeSshActions };
