// B"H
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const Device = require('../../tools/fs/deviceStateRoot.js');
const C = require('./correlation-scope.js');

const FILTER_FIELDS = [
  'tunnelName', 'deviceName', 'projectRoot', 'workspaceId',
  'agentSessionId', 'logicalAgentId', 'conversationId', 'missionId',
  'roomId', 'leaseId', 'workerId', 'jobId', 'receiptId', 'actionId',
  'controlRequestId', 'clientRequestId', 'traceId', 'spanId', 'kind'
];

let localSeq = 0;
let appendQueue = Promise.resolve();

/**
 * Appends lightweight action lifecycle events to device-local JSONL storage.
 *
 * The stream is intentionally separate from action result storage. It records
 * scheduling and runtime phases even when an action is rejected, times out, or
 * never reaches the fs action ledger.
 *
 * @param {object} config Agent configuration.
 * @param {object} event Event fields such as phase, payload, result, and lane.
 * @returns {object} The normalized event that was scheduled for append.
 */
function emit(config = {}, event = {}) {
  const row = normalizeEvent(config, event);
  const file = streamPath(config);
  appendQueue = appendQueue.then(() => appendRow(file, row)).catch(() => {});
  return row;
}

async function appendRow(file, row) {
  await fs.promises.mkdir(path.dirname(file), { recursive: true });
  await fs.promises.appendFile(file, JSON.stringify(row) + '\n');
}

/**
 * Lists stream events with cursor resume and scope filters.
 *
 * @param {object} config Agent configuration.
 * @param {object} query Cursor, limit, and optional scope filters.
 * @returns {{events: object[], nextCursor: string, hasMore: boolean, scanned: number}}
 */
function list(config = {}, query = {}) {
  const rows = readRows(config, query.maxBytes);
  const start = cursorIndex(rows, query.cursor || query.afterEventId);
  const filtered = rows.slice(start).filter(row => matches(row, query));
  const limit = boundedLimit(query.limit);
  const events = filtered.slice(0, limit);
  const nextCursor = events.length ? events[events.length - 1].eventId : String(query.cursor || query.afterEventId || '');
  return { events, nextCursor, hasMore: filtered.length > events.length, scanned: rows.length };
}

/** @returns {string} Absolute path to the stream JSONL file. */
function streamPath(config = {}) {
  return path.join(Device.awtsmoosRoot(config), 'runtime', 'action-stream.jsonl');
}

function normalizeEvent(config = {}, event = {}) {
  const payload = event.payload || event.input || {};
  const scope = C.extractCorrelationScope(payload);
  const now = new Date().toISOString();
  const phase = String(event.phase || event.type || 'action.event');
  const action = String(event.action || payload.action || event.requestAction || 'unknown');
  return clean({
    eventId: event.eventId || id('evt'),
    phase,
    type: phase,
    action,
    kind: event.kind || payload.kind || '',
    requestAction: event.requestAction || payload.requestAction || action,
    actualAction: event.actualAction || payload.actualAction || '',
    ok: event.ok,
    status: event.status,
    error: event.error,
    message: event.message,
    lane: event.lane,
    queuedMs: numberOrNull(event.queuedMs),
    runtimeMs: numberOrNull(event.runtimeMs),
    createdAt: event.createdAt || now,
    source: event.source || 'tunnel-agent',
    tunnelName: scope.tunnelName || config.tunnelName || '',
    deviceName: scope.deviceName || '',
    projectRoot: scope.projectRoot || config.root || '',
    workspaceId: scope.workspaceId || '',
    agentSessionId: scope.agentSessionId || '',
    logicalAgentId: scope.logicalAgentId || '',
    conversationId: scope.conversationId || '',
    conversationName: scope.conversationName || '',
    missionId: scope.missionId || '',
    roomId: scope.roomId || '',
    leaseId: scope.leaseId || '',
    workerId: event.workerId || scope.workerId || event.result?.workerId || '',
    jobId: event.jobId || scope.jobId || event.result?.jobId || '',
    receiptId: event.receiptId || scope.receiptId || event.result?.receiptId || event.result?.receipt?.receiptId || '',
    actionId: event.actionId || scope.actionId || event.result?.actionId || '',
    controlRequestId: scope.controlRequestId || '',
    clientRequestId: scope.clientRequestId || '',
    traceId: scope.traceId || '',
    spanId: scope.spanId || '',
    parentActionId: scope.parentActionId || '',
    payloadKeys: Object.keys(payload || {}).sort().slice(0, 80),
    resultSummary: summarizeResult(event.result)
  });
}

function summarizeResult(result) {
  if (!result || typeof result !== 'object') return undefined;
  return clean({
    ok: result.ok,
    action: result.action,
    status: result.status,
    error: result.error,
    jobId: result.jobId,
    workerId: result.workerId,
    receiptId: result.receiptId || result.receipt?.receiptId,
    actionId: result.actionId,
    outputRef: result.outputRef,
    inputRef: result.inputRef
  });
}

function readRows(config = {}, maxBytes) {
  const file = streamPath(config);
  let text = '';
  try {
    const stat = fs.statSync(file);
    const size = Math.min(stat.size, boundedBytes(maxBytes));
    const fd = fs.openSync(file, 'r');
    const buffer = Buffer.alloc(size);
    fs.readSync(fd, buffer, 0, size, Math.max(0, stat.size - size));
    fs.closeSync(fd);
    text = buffer.toString('utf8');
  } catch (_) {
    return [];
  }
  return text.split(/\r?\n/).map(line => {
    try { return line.trim() ? JSON.parse(line) : null; } catch (_) { return null; }
  }).filter(Boolean);
}

function cursorIndex(rows, cursor) {
  if (!cursor) return 0;
  const index = rows.findIndex(row => row.eventId === cursor);
  return index < 0 ? 0 : index + 1;
}

function matches(row, query = {}) {
  for (const key of FILTER_FIELDS) {
    if (query[key] && String(row[key] || '') !== String(query[key])) return false;
  }
  if (query.phase && String(row.phase || '') !== String(query.phase)) return false;
  if (query.action && String(row.action || '') !== String(query.action)) return false;
  return true;
}

function id(prefix) {
  localSeq = (localSeq + 1) % 1000000;
  return `${prefix}_${Date.now().toString(36)}_${process.pid}_${localSeq}_${crypto.randomBytes(3).toString('hex')}`;
}

function clean(obj = {}) {
  const out = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null && value !== '') out[key] = value;
  }
  return out;
}

function numberOrNull(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function boundedLimit(value) {
  const n = Number(value || 100);
  return Math.max(1, Math.min(Number.isFinite(n) ? n : 100, 1000));
}

function boundedBytes(value) {
  const n = Number(value || 5 * 1024 * 1024);
  return Math.max(64 * 1024, Math.min(Number.isFinite(n) ? n : 5 * 1024 * 1024, 50 * 1024 * 1024));
}

module.exports = { emit, list, streamPath, normalizeEvent, matches };
