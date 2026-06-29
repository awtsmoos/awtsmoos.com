// B"H
const { withDb } = require('../../awdb/open.js'); const C = require('../../awdb/collections.js');
function accept(config, lock = {}, payload = {}) { const row = { missionId:lock.missionId, agentId:payload.agentId || payload.logicalAgentId || 'anonymous', acceptedAt:new Date().toISOString(), statement:'I accept the active mission lock.' }; withDb(config, 'missions', db => C.ensure(db.root, 'missionOaths', []).push(row)); return row; }
function list(config) { try { return withDb(config, 'missions', db => C.plain(db.root.missionOaths || [])); } catch { return []; } }
module.exports = { accept, list };
