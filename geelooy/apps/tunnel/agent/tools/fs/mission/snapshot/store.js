// B"H
const { withDb } = require('../../awdb/open.js'); const C = require('../../awdb/collections.js');
function take(config, lock = {}, reason = 'manual') { const row = { missionId:lock.missionId, reason, at:new Date().toISOString(), lock:C.plain(lock) }; withDb(config, 'missions', db => C.ensure(db.root, 'missionSnapshots', []).push(row)); return row; }
function list(config) { try { return withDb(config, 'missions', db => C.plain(db.root.missionSnapshots || [])); } catch { return []; } }
module.exports = { take, list };
