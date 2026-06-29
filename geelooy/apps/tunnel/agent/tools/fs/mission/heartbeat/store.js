// B"H
const { withDb } = require('../../awdb/open.js');
const C = require('../../awdb/collections.js');
function write(config, heartbeat) { return withDb(config, 'missions', db => { C.ensure(db.root, 'missionHeartbeats')[heartbeat.missionId || 'project'] = heartbeat; return heartbeat; }); }
function read(config, missionId = 'project') { try { return withDb(config, 'missions', db => C.plain(C.ensure(db.root, 'missionHeartbeats')[missionId])); } catch { return null; } }
module.exports = { write, read };
