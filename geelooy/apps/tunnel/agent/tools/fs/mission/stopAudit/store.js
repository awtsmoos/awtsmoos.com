// B"H
const { withDb } = require('../../awdb/open.js');
const C = require('../../awdb/collections.js');
function row(lock = {}, result = {}, kind = 'stop_attempt') {
  return { kind, missionId:lock.missionId || result.missionId, action:result.action,
    at:new Date().toISOString(), finalAnswerAllowed:result.finalAnswerAllowed,
    intercepted:!!result.interceptedFinalAnswer, reason:result.stopReason || result.reason || '', agentId:result.agentId || result.logicalAgentId || '' };
}
function record(config, lock = {}, result = {}, kind) {
  const item = row(lock, result, kind);
  withDb(config, 'missions', db => C.ensure(db.root, 'missionStopAttempts', []).push(item));
  return item;
}
function list(config) { try { return withDb(config, 'missions', db => C.plain(db.root.missionStopAttempts || [])); } catch { return []; } }
module.exports = { record, list, row };
