// B"H
const fsp = require('fs/promises');
const Shell = require('../../../lib/fakeSsh/shell.js');
const Auth = require('../../../lib/fakeSsh/auth.js');
const Session = require('../../../lib/fakeSsh/session.js');
const Commands = require('../../../lib/fakeSsh/commands.js');
const Sftp = require('../../../lib/fakeSsh/sftpAdapter.js');
const Plan = require('../../../lib/fakeSsh/serverPlan.js');
const { safePath, rel, assertNotSecret } = require('../pathGuard.js');
const sessions = new Map();
function session(payload) { return sessions.get(payload.sessionId || payload.sshSessionId || '') || null; }
function content(payload) { return payload.content || (payload.content64 ? Buffer.from(String(payload.content64), 'base64').toString('utf8') : ''); }
function buildFakeSshActions(ctx) { const { config, payload = {} } = ctx; return {
  async fakeSshAuth() { const auth = await Auth.authenticate(config, payload); if (!auth.ok) return { ok:false, action:'fakeSshAuth', ...auth }; const s = Session.create(auth, payload); sessions.set(s.id, s); return { ok:true, action:'fakeSshAuth', session:s, sessionToken:auth.sessionToken }; },
  async fakeSshSession() { return { ok:true, action:'fakeSshSession', sessions:[...sessions.values()] }; },
  async fakeSshClose() { const id = payload.sessionId || payload.sshSessionId || ''; const closed = sessions.delete(id); return { ok:true, action:'fakeSshClose', sessionId:id, closed }; },
  async fakeSshExec() { const s = session(payload); if (!s) return { ok:false, action:'fakeSshExec', error:'ssh_session_not_found' }; return { ok:true, action:'fakeSshExec', session:Session.touch(s), result:await Commands.run(config, s, payload.command || payload.text || 'pwd') }; },
  async fakeSshSftpList() { const s = session(payload); if (!s) return { ok:false, action:'fakeSshSftpList', error:'ssh_session_not_found' }; return { ok:true, action:'fakeSshSftpList', items:await Sftp.readdir(config, s.cwd, payload.path || payload.p || '.') }; },
  async fakeSshSftpStat() { const s = session(payload); if (!s) return { ok:false, action:'fakeSshSftpStat', error:'ssh_session_not_found' }; return { ok:true, action:'fakeSshSftpStat', stat:await Sftp.stat(config, s.cwd, payload.path || payload.p || '.') }; },
  async fakeSshSftpRead() { const s = session(payload); if (!s) return { ok:false, action:'fakeSshSftpRead', error:'ssh_session_not_found' }; const got = await Sftp.readFile(config, s.cwd, payload.path || payload.p || '.', 'utf8'); return { ok:true, action:'fakeSshSftpRead', ...got }; },
  async fakeSshSftpWrite() { const s = session(payload); if (!s) return { ok:false, action:'fakeSshSftpWrite', error:'ssh_session_not_found' }; const got = await Sftp.writeFile(config, s.cwd, payload.path || payload.p || '.', content(payload)); return { ok:true, action:'fakeSshSftpWrite', ...got, readbackRequired:true }; },
  async fakeSshSftpMkdir() { const s = session(payload); if (!s) return { ok:false, action:'fakeSshSftpMkdir', error:'ssh_session_not_found' }; return { ok:true, action:'fakeSshSftpMkdir', ...(await Sftp.mkdir(config, s.cwd, payload.path || payload.p || '.')) }; },
  async fakeSshSftpRemove() { const s = session(payload); if (!s) return { ok:false, action:'fakeSshSftpRemove', error:'ssh_session_not_found' }; return { ok:true, action:'fakeSshSftpRemove', ...(await Sftp.remove(config, s.cwd, payload.path || payload.p || '.')) }; },
  async fakeSshServerPlan() { return { ok:true, action:'fakeSshServerPlan', plan:Plan.PLAN, wireProtocolReady:false, adapterReady:true }; },
  async fakeSshServerStatus() { return { ok:true, action:'fakeSshServerStatus', wireProtocolReady:false, virtualShellReady:true, sftpAdapterReady:true, sessions:[...sessions.values()] }; },
  async fakeSshMounts() { return { ok:true, action:'fakeSshMounts', mounts:Shell.mounts(config), prompt:Shell.prompt(payload.cwd || '/') }; },
  async fakeSshResolve() { return { ok:true, action:'fakeSshResolve', resolved:Shell.resolve(config, payload.cwd || '/', payload.path || payload.p || '.') }; },
  async fakeSshHelp() { return { ok:true, action:'fakeSshHelp', help:Shell.help() }; },
  async fakeSshRead() { const r = Shell.resolve(config, payload.cwd || '/', payload.path || payload.p || '.'); if (r.error) return { ok:false, action:'fakeSshRead', error:r.error, virtual:r.virtual }; const full = safePath(config, r.real); assertNotSecret(config, full); return { ok:true, action:'fakeSshRead', virtual:r.virtual, path:rel(config, full), content:await fsp.readFile(full, 'utf8') }; }
};}
/**
 * B"H
 * Fake SSH now has guarded SFTP operations. The TCP wire daemon remains a named
 * non-ready layer until ayzarim receives server-side channel/auth responders.
 */
module.exports = { buildFakeSshActions };
