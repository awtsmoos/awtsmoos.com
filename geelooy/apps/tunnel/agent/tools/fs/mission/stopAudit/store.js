// B"H
const { withDb } = require('../../awdb/open.js'); const C = require('../../awdb/collections.js');
function record(config, lock = {}, result = {}) { const row = { missionId:lock.missionId, action:result.action, at:new Date().toISOString(), finalAnswerAllowed:result.finalAnswerAllowed, intercepted:!!result.interceptedFinalAnswer }; withDb(config, 'missions', db => C.ensure(db.root, 'missionStopAttempts', []).push(row)); return row; }
function list(config) { try { return withDb(config, 'missions', db => C.plain(db.root.missionStopAttempts || [])); } catch { return []; } }
module.exports = { record, list };
