// B"H
const Firewall = require('../firewall/index.js');
const EMERGENCY = new Set([
  'awtsmoosMyDevice','payloadEcho','actionSchemaTrace',
  'agentDoctor','agentSelfTest','agentVersionSkewCheck',
  'tunnelDoctor','tunnelLivenessTimeline','runtimeSnapshot',
  'missionGet','missionList','missionStatus','missionRecovery',
  'missionHeartbeat','missionNext','missionAnswer','missionFinalize',
  'missionEarlyFinalAttempt','missionMetadataStatus','missionBootResume',
  'missionDaemonStatus','missionDaemonTick','missionDaemonRecover',
  'missionDaemonStart','missionWatchdogStatus','missionWatchdogTick',
  'missionWatchdogRecover','missionContinueUntilGate','missionContinueOneHour',
  'continueMustCallNext','command','commandRun','shellCommand',
  'run_terminal_command','commandStart','commandStatus','commandWait',
  'commandJobStatus','commandJobOutputPage','commandCancel','commandPoll',
  'commandJobWait','commandOutputPage','actionHistoryList','actionHistoryGet',
  'actionHistorySearch','actionHistoryExplain','actionHistoryDiff',
  'actionHistoryReplay','actionHistoryGarbageCollect','actionHistoryPin',
  'actionHistoryUnpin'
]);
function enabled(payload = {}) {
  if (payload.ignoreMissionLock === true || payload.ignoreMissionLock === 'true') return false;
  return process.env.AWTSMOOS_MISSION_EXCLUSIVE !== '0';
}
function isMission(action = '') { return String(action).startsWith('mission'); }
function isHistory(action = '') { return String(action).startsWith('actionHistory'); }
function allowed(action = '') {
  const kind = Firewall.classify(action);
  return isMission(action) || isHistory(action) || EMERGENCY.has(action) || kind === 'missionEvidence';
}
module.exports = { enabled, allowed, EMERGENCY };
