// B"H
const crypto = require('crypto');

const FIELD_ALIASES = {
  tunnelName: ['tunnelName'],
  requestedTunnelName: ['requestedTunnelName'],
  deviceName: ['deviceName'],
  projectRoot: ['projectRoot', 'root'],
  workspaceId: ['workspaceId'],
  agentSessionId: ['agentSessionId'],
  logicalAgentId: ['logicalAgentId', 'agentId'],
  agentName: ['agentName'],
  conversationId: ['conversationId'],
  conversationName: ['conversationName'],
  missionId: ['missionId'],
  roomId: ['roomId'],
  leaseId: ['leaseId', 'agentLeaseId'],
  workerId: ['workerId'],
  jobId: ['jobId'],
  receiptId: ['receiptId'],
  actionId: ['actionId'],
  controlRequestId: ['controlRequestId', 'requestId', 'id'],
  clientRequestId: ['clientRequestId', 'requestId'],
  nonce: ['nonce'],
  parentActionId: ['parentActionId'],
  traceId: ['traceId', 'correlationId'],
  spanId: ['spanId'],
  causalParentId: ['causalParentId'],
  startedAt: ['startedAt'],
  source: ['source'],
  correlationId: ['correlationId', 'traceId']
};

const CARRIER_KEYS = [
  'params',
  'params64',
  'payload',
  'payload64',
  'p',
  'body',
  'body64',
  'content',
  'content64',
  'input',
  'request',
  'browserRequest',
  'osRequest',
  'virtualOsRequest'
];

const BASE64_KEYS = new Set(['params64', 'payload64', 'content64', 'body64']);
const MAX_PARSE_CHARS = 256 * 1024;

function id(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${crypto.randomBytes(4).toString('hex')}`;
}

function cleanValue(value) {
  if (value == null || value === '') return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return '';
}

function pick(obj, aliases) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return '';
  for (const key of aliases) {
    const value = cleanValue(obj[key]);
    if (value) return value;
  }
  return '';
}

function directFields(obj = {}) {
  const out = {};
  for (const [field, aliases] of Object.entries(FIELD_ALIASES)) {
    const value = pick(obj, aliases);
    if (value) out[field] = value;
  }
  return out;
}

function mergeMissing(target, source) {
  for (const [key, value] of Object.entries(source || {})) {
    if (value && !target[key]) target[key] = value;
  }
  return target;
}

function jsonish(value, key = '') {
  if (!value) return null;
  if (typeof value === 'object' && !Array.isArray(value)) return value;
  if (typeof value !== 'string') return null;
  if (value.length > MAX_PARSE_CHARS) return null;
  let text = value.trim();
  if (!text) return null;
  if (BASE64_KEYS.has(key)) {
    try { text = Buffer.from(text, 'base64').toString('utf8').trim(); } catch (_) { return null; }
  }
  if (!text || !/^[{\[]/.test(text)) return null;
  try {
    const parsed = JSON.parse(text);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null;
  } catch (_) {
    return null;
  }
}

function decodeCarrier(value, key = '') {
  return jsonish(value, key);
}

function carrierObjects(obj = {}) {
  const out = [];
  for (const key of CARRIER_KEYS) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
    const parsed = jsonish(obj[key], key);
    if (parsed) out.push(parsed);
  }
  return out;
}

function scanObject(obj, seen = new Set(), depth = 0) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj) || depth > 4 || seen.has(obj)) return {};
  seen.add(obj);
  const out = directFields(obj);
  for (const carrier of carrierObjects(obj)) mergeMissing(out, scanObject(carrier, seen, depth + 1));
  return out;
}

function outerWithoutPayload(input = {}) {
  const copy = { ...input };
  for (const key of ['payload', 'payload64']) delete copy[key];
  return copy;
}

function extractCorrelationScope(input = {}) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return {};
  const out = {};
  const payload = jsonish(input.payload, 'payload') || (input.payload && typeof input.payload === 'object' && !Array.isArray(input.payload) ? input.payload : null);
  if (payload) {
    mergeMissing(out, scanObject(payload));
    mergeMissing(out, scanObject(outerWithoutPayload(input)));
    return out;
  }
  mergeMissing(out, scanObject(input));
  return out;
}

function withFallbacks(scope = {}) {
  const out = Object.fromEntries(Object.keys(FIELD_ALIASES).map(key => [key, scope[key] || '']));
  if (!out.controlRequestId) out.controlRequestId = id('ctrl');
  if (!out.clientRequestId) out.clientRequestId = id('client');
  if (!out.nonce) out.nonce = id('nonce');
  return out;
}

function clean(obj = {}) {
  const out = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null && value !== '') out[key] = value;
  }
  return out;
}

function mergeCorrelationScope(payload = {}) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return payload;
  return { ...payload, ...extractCorrelationScope(payload) };
}

function correlationFields(payload = {}) {
  return withFallbacks(extractCorrelationScope(payload));
}

function correlationEnv(scope = {}) {
  const s = extractCorrelationScope(scope);
  return clean({
    AWTSMOOS_TUNNEL_NAME: s.tunnelName,
    AWTSMOOS_DEVICE_NAME: s.deviceName,
    AWTSMOOS_PROJECT_ROOT: s.projectRoot,
    AWTSMOOS_WORKSPACE_ID: s.workspaceId,
    AWTSMOOS_AGENT_SESSION_ID: s.agentSessionId,
    AWTSMOOS_LOGICAL_AGENT_ID: s.logicalAgentId,
    AWTSMOOS_AGENT_NAME: s.agentName,
    AWTSMOOS_CONVERSATION_ID: s.conversationId,
    AWTSMOOS_CONVERSATION_NAME: s.conversationName,
    AWTSMOOS_MISSION_ID: s.missionId,
    AWTSMOOS_ROOM_ID: s.roomId,
    AWTSMOOS_LEASE_ID: s.leaseId,
    AWTSMOOS_TRACE_ID: s.traceId,
    AWTSMOOS_SPAN_ID: s.spanId,
    AWTSMOOS_NONCE: s.nonce
  });
}

function correlationReceipt(scope = {}) {
  const s = extractCorrelationScope(scope);
  return clean({
    receiptId: s.receiptId,
    jobId: s.jobId,
    workerId: s.workerId,
    missionId: s.missionId,
    roomId: s.roomId,
    agentSessionId: s.agentSessionId,
    logicalAgentId: s.logicalAgentId,
    conversationId: s.conversationId,
    conversationName: s.conversationName,
    leaseId: s.leaseId,
    traceId: s.traceId,
    spanId: s.spanId,
    source: s.source
  });
}

function correlationPreview(scope = {}) {
  const s = extractCorrelationScope(scope);
  return clean({
    tunnelName: s.tunnelName,
    projectRoot: s.projectRoot,
    workspaceId: s.workspaceId,
    missionId: s.missionId,
    roomId: s.roomId,
    agentSessionId: s.agentSessionId,
    logicalAgentId: s.logicalAgentId,
    conversationId: s.conversationId,
    actionId: s.actionId,
    traceId: s.traceId,
    source: s.source
  });
}

function correlationWorker(scope = {}) {
  const s = extractCorrelationScope(scope);
  return clean({
    workerId: s.workerId,
    jobId: s.jobId,
    receiptId: s.receiptId,
    missionId: s.missionId,
    roomId: s.roomId,
    agentSessionId: s.agentSessionId,
    logicalAgentId: s.logicalAgentId,
    conversationId: s.conversationId,
    conversationName: s.conversationName,
    leaseId: s.leaseId,
    parentActionId: s.parentActionId,
    traceId: s.traceId,
    spanId: s.spanId,
    causalParentId: s.causalParentId,
    startedAt: s.startedAt,
    source: s.source
  });
}

function correlationEnvelope(scope = {}) {
  return clean(correlationFields(scope));
}

module.exports = {
  extractCorrelationScope,
  mergeCorrelationScope,
  correlationFields,
  correlationEnv,
  correlationReceipt,
  correlationPreview,
  correlationWorker,
  correlationEnvelope,
  decodeCarrier,
  fields: correlationFields
};
