// B"H

/** B"H — Chapter 817: Aliases became honest names, not false mismatches. */
function verifyTunnelResponse(result = {}, payload = {}, tunnelName = "") {
  const errors = [];
  requireMatch(errors, "controlRequestId", payload.controlRequestId, result.controlRequestId);
  requireMatch(errors, "clientRequestId", payload.clientRequestId, result.clientRequestId);
  requireMatch(errors, "nonce", payload.nonce, result.nonce);
  if (payload.action && result.requestAction && !allowedActionAlias(payload.action, result.requestAction)) errors.push(`requestAction expected ${payload.action} got ${result.requestAction}`);
  if (payload.jobId && result.jobId && payload.jobId !== result.jobId) errors.push(`jobId expected ${payload.jobId} got ${result.jobId}`);
  if (payload.stream && result.stream && payload.stream !== result.stream) errors.push(`stream expected ${payload.stream} got ${result.stream}`);
  return errors.length ? mismatch(payload, result, tunnelName, errors) : result;
}

function requireMatch(errors, field, expected, actual) {
  if (!expected) return;
  if (!actual) return errors.push(`${field} expected ${expected} but response omitted ${field}`);
  if (String(expected) !== String(actual)) errors.push(`${field} expected ${expected} got ${actual}`);
}

function mismatch(payload, result, tunnelName, errors) {
  return { BH: "B\"H", ok: false, status: 409, error: "tunnel_response_correlation_mismatch", tunnelName, expected: snapshot(payload), actual: snapshot(result), mismatchProof: errors, rawMismatchedResponse: result };
}

function snapshot(value = {}) {
  return { action: value.action, requestAction: value.requestAction, actualAction: value.actualAction, controlRequestId: value.controlRequestId, clientRequestId: value.clientRequestId, nonce: value.nonce, jobId: value.jobId, stream: value.stream, path: value.path, absolutePath: value.absolutePath };
}

function allowedActionAlias(expected, actual) {
  if (expected === actual) return true;
  const aliases = {
    command: ["command", "commandRun", "commandStart"],
    commandRun: ["command", "commandRun", "commandStart"],
    commandWait: ["commandWait", "commandStatus", "commandStart"],
    commandJobOutputPage: ["commandJobOutputPage"],
    commandStatus: ["commandStatus", "commandStart"],
    commandOutputPage: ["commandJobOutputPage", "commandOutputPage"],
    nodeCheckFiles: ["nodeCheckFiles", "nodeCheckMany"],
    nodeCheckMany: ["nodeCheckFiles", "nodeCheckMany"]
  };
  return (aliases[expected] || []).includes(actual);
}

module.exports = { verifyTunnelResponse, allowedActionAlias };
