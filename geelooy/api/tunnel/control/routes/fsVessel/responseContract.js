// B"H

/**
 * B"H — Chapter 1803: Correlation remains strict about identity, but merciful
 * about transport implementation details. A wait may be fulfilled by a status
 * envelope, and an output alias may use its canonical job output route, while
 * nonce/client/job/thread identity still guards the gate.
 */
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
    commandStart: ["command", "commandRun", "commandStart"],
    commandOutputPage: ["commandJobOutputPage", "commandOutputPage"],
    commandJobOutputPage: ["commandJobOutputPage", "commandOutputPage"],
    commandPoll: ["commandStatus", "commandPoll", "commandJobStatus"],
    commandStatus: ["commandStatus", "commandPoll", "commandJobStatus"],
    commandJobStatus: ["commandStatus", "commandPoll", "commandJobStatus"],
    commandWait: ["commandWait", "commandStatus", "commandJobStatus"],
    commandJobWait: ["commandWait", "commandJobWait", "commandStatus", "commandJobStatus"],
    nodeCheckFiles: ["nodeCheckFiles", "nodeCheckMany"],
    nodeCheckMany: ["nodeCheckFiles", "nodeCheckMany"]
  };
  return (aliases[expected] || []).includes(actual);
}

module.exports = { verifyTunnelResponse, allowedActionAlias };
