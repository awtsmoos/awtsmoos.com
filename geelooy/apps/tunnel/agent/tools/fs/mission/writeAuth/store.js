// B"H
const { withDb } = require('../../awdb/open.js'); const C = require('../../awdb/collections.js');
function add(config, grant) { return withDb(config, 'missions', db => { const g = C.ensure(db.root, 'missionWriteAuth', {}); g[grant.token] = grant; return grant; }); }
function get(config, token) { try { return withDb(config, 'missions', db => C.plain(C.ensure(db.root, 'missionWriteAuth', {})[token])); } catch { return null; } }
function use(config, token) { return withDb(config, 'missions', db => { const g = C.ensure(db.root, 'missionWriteAuth', {}); if (!g[token] || g[token].used) return null; g[token].used = true; g[token].usedAt = new Date().toISOString(); return C.plain(g[token]); }); }
module.exports = { add, get, use };
