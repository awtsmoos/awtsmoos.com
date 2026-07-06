// B"H
const LANES = Object.freeze({ P0:'p0_control', P1:'p1_fs_light', P2:'p2_chrome_light', P3:'p3_heavy', P4:'p4_bulk' });
const LANE_ORDER = Object.freeze([LANES.P0, LANES.P1, LANES.P2, LANES.P3, LANES.P4]);
const CONTROL_ACTIONS = new Set([
  'heartbeat','tunnelHeartbeat','agentHeartbeat','ping','pong','status',
  'tunnelStatus','agentStatus','commandStatus','commandPoll','commandJobStatus','jobStatus',
  'commandCancel','commandJobCancel','commandJobOutputPage','commandOutputPage','payloadEcho','configGet',
  'tunnelDoctor','tunnelLivenessTimeline','agentDoctor','agentSelfTest','agentVersionSkewCheck',
  'runtimeSnapshot','actionSchemaTrace','actionHistoryGet','actionHistoryList','actionHistorySearch',
  'actionTimeline','actionStream','agentActionStream','missionActionStream','roomActionStream','workerActionStream','browserActionStream','fsActionStream',
  'treeStatus','treePage','treeStream','treeSummary','treeCancel','rgStatus','rgPage','rgStream','rgSummary','rgCancel',
  'missionGet','missionStatus','missionRecovery','missionHeartbeat','missionDaemonStatus',
  'missionWatchdogStatus','missionWatchdogRecover'
]);
const FS_LIGHT_ACTIONS = new Set(['stat','read','read64','readBytes','readLines','readManyLines','md','list','configGet','fileHashes','recentFiles','connectedFiles']);
const CHROME_LIGHT_ACTIONS = new Set(['chromeStatus','chromeLogs','browserDoctor','browserConsoleTriage','consoleErrorTriage']);
const BULK_ACTIONS = new Set(['tree','treeStart','treeManifest','treeDiff','treeIndex','findFiles','grep','rgStart','rgRefine','rgRerun','selectString','bulk','bulkWrite','bulkWriteIfHashes','bulkRead','actionBatch','commandBatch','parallelActionBatch','forEachActionBatch','missionAuto','missionAutopilot','missionLoopPulse','missionContinueOneHour','missionContinueUntilGate','runtimeWorkflow','simulateRuntime','testMatrixRunner','stressMatrix','previewCreate','previewFolder','previewPage','previewCollection','previewLiveCommand','chromeSnapshot','chromeSnapshotScoped','chromeFind']);
const PRIORITY_ACTIONS = CONTROL_ACTIONS;

/**
 * B"H
 * The control lane is the breath of the palace, not the quarry. Status and
 * cancel may pass there; waiting, paging, grepping, trees, previews, snapshots,
 * and all disk-heavy sight must descend into lower lanes so one agent's mountain
 * never blocks another agent's heartbeat.
 */
function actionOf(item = {}) { return String(item.data?.payload?.action || item.payload?.action || item.action || ''); }
function kindOf(item = {}) { return String(item.data?.payload?.kind || item.payload?.kind || item.kind || ''); }
function laneForAction(action = '', kind = '') {
  const a = String(action || '');
  if (CONTROL_ACTIONS.has(a)) return LANES.P0;
  if (BULK_ACTIONS.has(a) || /^mission|runtime|simulate|stress|bulk/i.test(a)) return LANES.P4;
  if (kind === 'chrome' || /^chrome|browser/i.test(a)) return CHROME_LIGHT_ACTIONS.has(a) ? LANES.P2 : LANES.P3;
  if (a === 'commandWait' || a === 'commandJobWait' || a === 'waitForJob' || a === 'jobWait') return LANES.P3;
  if (a === 'commandJobOutputPage' || a === 'commandOutputPage') return LANES.P3;
  if (kind === 'command' || /^command/.test(a)) return LANES.P3;
  if (kind === 'fs' && FS_LIGHT_ACTIONS.has(a)) return LANES.P1;
  if (kind === 'fs') return LANES.P4;
  return LANES.P3;
}
function laneOf(item = {}) { return laneForAction(actionOf(item), kindOf(item)); }
function isPriority(item = {}) { return laneOf(item) === LANES.P0; }
function makeLaneState() { return Object.fromEntries(LANE_ORDER.map(lane => [lane, { inflight:0, queue:[] }])); }
function enqueue(queue, item) { if (Array.isArray(queue)) return legacyEnqueue(queue, item); const lane = laneOf(item); item.lane = lane; queue[lane].queue.push(item); return queue; }
function legacyEnqueue(queue, item) { if (!isPriority(item)) { queue.push(item); return queue; } let i = 0; while (i < queue.length && isPriority(queue[i])) i++; queue.splice(i, 0, item); return queue; }
function queuedCount(lanes = {}) { return LANE_ORDER.reduce((n, lane) => n + (lanes[lane]?.queue.length || 0), 0); }
function inflightCount(lanes = {}) { return LANE_ORDER.reduce((n, lane) => n + (lanes[lane]?.inflight || 0), 0); }
function canStartLane(lanes = {}, lane = '', limits = {}) { const current = lanes[lane]; if (!current?.queue.length) return false; if (current.inflight >= Number(limits.LANE_LIMITS?.[lane] || 1)) return false; return lane === LANES.P0 || inflightCount(lanes) < Number(limits.MAX_INFLIGHT || 1); }
function canQueue(lanes = {}, lane = '', limits = {}) { if (lane === LANES.P0) return (lanes[lane]?.queue.length || 0) < Number(limits.CONTROL_QUEUE_LIMIT || 256); return queuedCount(lanes) < Number(limits.MAX_QUEUE || 0); }
module.exports = { LANES, LANE_ORDER, PRIORITY_ACTIONS, CONTROL_ACTIONS, actionOf, canQueue, canStartLane, enqueue, inflightCount, isPriority, laneForAction, laneOf, makeLaneState, queuedCount };
