// B"H
const Stream = require('../../../lib/runtime/action-stream.js');

const ACTIONS = [
  'actionTimeline',
  'actionStream',
  'agentActionStream',
  'missionActionStream',
  'roomActionStream',
  'workerActionStream',
  'browserActionStream',
  'fsActionStream'
];

/**
 * Exposes the device-local action stream through normal fs actions.
 *
 * The same implementation backs all stream views. Specific action names apply
 * a default filter while preserving explicit cursor, limit, and scope fields.
 */
function buildActionStreamActions(ctx = {}) {
  const { config, payload } = ctx;
  const api = {};
  for (const name of ACTIONS) api[name] = async () => stream(config, payload, name);
  return api;
}

function stream(config = {}, payload = {}, action = 'actionStream') {
  const query = withActionDefaults(payload, action);
  const page = Stream.list(config, query);
  return {
    ok: true,
    action,
    streamPath: Stream.streamPath(config),
    filters: filters(query),
    cursor: payload.cursor || payload.afterEventId || '',
    nextCursor: page.nextCursor,
    hasMore: page.hasMore,
    count: page.events.length,
    scanned: page.scanned,
    events: page.events
  };
}

function withActionDefaults(payload = {}, action = '') {
  const query = { ...payload };
  query.action = payload.eventAction || payload.targetAction || payload.actionFilter || '';
  if (action === 'agentActionStream') query.logicalAgentId ||= payload.agentId || payload.agentName;
  if (action === 'missionActionStream') query.missionId ||= payload.id;
  if (action === 'roomActionStream') query.roomId ||= payload.id || payload.missionRoomId;
  if (action === 'workerActionStream') query.workerId ||= payload.id;
  if (action === 'browserActionStream') query.kind ||= 'chrome';
  if (action === 'fsActionStream') query.kind ||= 'fs';
  return query;
}

function filters(query = {}) {
  const keys = [
    'action', 'phase', 'tunnelName', 'projectRoot', 'workspaceId',
    'agentSessionId', 'logicalAgentId', 'conversationId', 'missionId',
    'roomId', 'workerId', 'jobId', 'receiptId', 'actionId',
    'controlRequestId', 'clientRequestId', 'traceId', 'spanId'
  ];
  return Object.fromEntries(keys.filter(key => query[key]).map(key => [key, query[key]]));
}

module.exports = { buildActionStreamActions, stream, withActionDefaults, ACTIONS };
