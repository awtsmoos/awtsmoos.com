// B"H
function parsedParams(params) {
  if (!params) return {};
  if (typeof params === 'object' && !Array.isArray(params)) return params;
  if (typeof params !== 'string') return {};
  try {
    const got = JSON.parse(params);
    return got && typeof got === 'object' && !Array.isArray(got) ? got : {};
  } catch {
    return {};
  }
}
function first(input, keys) {
  for (const key of keys) {
    const value = input?.[key];
    if (value !== undefined && value !== null && String(value) !== '') return value;
  }
  return '';
}
function normalizeActionIdentity(input = {}) {
  const params = parsedParams(input.params);
  const payload = object(input.payload);
  const p = object(input.p);
  const action = first(input, ['action', 'requestAction', 'actualAction']) ||
    first(payload, ['action', 'requestAction', 'actualAction']) ||
    first(p, ['action', 'requestAction', 'actualAction']) ||
    first(params, ['action', 'requestAction', 'actualAction']) ||
    'unknown';
  return {
    action: String(action),
    requestAction: String(first(input, ['requestAction']) || action),
    actualAction: String(first(input, ['actualAction']) || first(input, ['requestAction']) || action)
  };
}
function normalizeActionPayload(input = {}) {
  const params = parsedParams(input.params);
  const payload = object(input.payload);
  const p = object(input.p);
  const merged = { ...params, ...p, ...payload, ...input };
  const id = normalizeActionIdentity(input);
  if (id.action === 'unknown') {
    return {
      ...merged,
      ...id,
      ok: false,
      normalized: false,
      error: 'missing_action',
      originalInputKeys: Object.keys(input).sort()
    };
  }
  return { ...merged, ...id, normalized: true };
}
function preservedErrorEnvelope({ request = {}, action = '', error, message, details, recovery, mission, status = 400, ok = false, extra = {} } = {}) {
  const id = normalizeActionIdentity({ ...request, action: action || request.action || request.requestAction });
  return clean({
    ok, status,
    action: id.action,
    requestAction: id.requestAction,
    actualAction: id.actualAction,
    actionMismatch: false,
    error, message, details, recovery, mission,
    ...extra
  });
}
function preserveActionIdentity(request = {}, result = {}) {
  const id = normalizeActionIdentity({ ...request, action: request.action || result.requestAction || result.action });
  return { ...result, action: id.action, requestAction: id.requestAction, actualAction: id.actualAction, actionMismatch: false };
}
function missingActionEnvelope(request = {}) {
  const id = normalizeActionIdentity(request);
  return preservedErrorEnvelope({
    request: { ...request, action: id.action },
    error: 'missing_action',
    message: 'No action was found on action, requestAction, payload.action, p.action, or parsed params.action.',
    details: { originalInputKeys: Object.keys(request || {}).sort() },
    recovery: { suggestedAction: 'actionSchemaTrace' },
    status: 400
  });
}
function plannedRestartEnvelope(request = {}, receipt = {}) {
  return preservedErrorEnvelope({
    request,
    error: 'planned_restart_pending',
    message: 'A planned tunnel restart is in progress; rediscover the tunnel before treating this as dead.',
    status: 202,
    recovery: { handoffId: receipt.handoffId || '', expectedReconnectMs: receipt.expectedReconnectMs || 15000, suggestedAction: 'tunnelLivenessTimeline' },
    extra: { plannedRestart: true, handoff: receipt, retryable: true }
  });
}
function fallbackReceipt(request = {}, overrides = {}) {
  const id = normalizeActionIdentity(request);
  return {
    receiptId: overrides.receiptId || `receipt_${Date.now().toString(36)}`,
    requestAction: id.requestAction,
    actualAction: id.actualAction,
    targetTunnelName: overrides.targetTunnelName || request.tunnelName || '',
    targetVesselType: overrides.targetVesselType || 'native-local',
    fallbackVesselType: overrides.fallbackVesselType || 'awtsmoos-code',
    status: overrides.status || 'queued_waiting_for_reconnect',
    createdAt: overrides.createdAt || new Date().toISOString(),
    safeToReplay: overrides.safeToReplay === true,
    requiresConfirmation: overrides.requiresConfirmation !== false,
    path: overrides.path || request.path || request.p || ''
  };
}
function lagCircuitEnvelope(request = {}, gate = {}) {
  return preservedErrorEnvelope({
    request,
    error: 'event_loop_lag_circuit_open',
    message: 'The tunnel event loop is lagging; only control and recovery actions should run now.',
    status: 429,
    recovery: { suggestedAction: 'retry_after_lag_or_use_narrower_path', retryAfterMs: gate.retryAfterMs || 2000 },
    extra: { retryable: true, lag: { level: gate.circuitLevel || gate.level || 'hard', lastMs: gate.eventLoopLagMs || 0, maxMs: gate.maxEventLoopLagMs || 0 }, gate }
  });
}
function object(value) { return value && typeof value === 'object' && !Array.isArray(value) ? value : {}; }
function clean(obj) { for (const key of Object.keys(obj)) if (obj[key] === undefined) delete obj[key]; return obj; }
module.exports = { parsedParams, normalizeActionIdentity, normalizeActionPayload, preservedErrorEnvelope, preserveActionIdentity, missingActionEnvelope, plannedRestartEnvelope, fallbackReceipt, lagCircuitEnvelope };
