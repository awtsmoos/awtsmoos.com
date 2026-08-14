// B"H

/** B"H — Chapter 818: The client guard learned the same aliases. */
export function newClientRequestId(action = "request") {
  const clean = String(action || "request").replace(/[^a-z0-9_-]+/gi, "-").slice(0, 32) || "request";
  return `tc_${clean}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export function attachRequestGuard(opts = {}) {
  const action = opts.action || "list";
  return { ...opts, clientRequestId: opts.clientRequestId || opts.requestId || newClientRequestId(action) };
}

export function validateResponseGuard(result = {}, expected = {}) {
  const errors = [];
  if (expected.clientRequestId && result.type === "TUNNEL_RESPONSE" && !result.clientRequestId) errors.push(`clientRequestId expected ${expected.clientRequestId} but response omitted clientRequestId`);
  if (expected.clientRequestId && result.clientRequestId && result.clientRequestId !== expected.clientRequestId) errors.push(`clientRequestId expected ${expected.clientRequestId} got ${result.clientRequestId}`);
  if (expected.action && result.requestAction && !allowedActionAlias(expected.action, result.requestAction)) errors.push(`requestAction expected ${expected.action} got ${result.requestAction}`);
  if (expected.jobId && result.jobId && result.jobId !== expected.jobId) errors.push(`jobId expected ${expected.jobId} got ${result.jobId}`);
  if (expected.stream && result.stream && result.stream !== expected.stream) errors.push(`stream expected ${expected.stream} got ${result.stream}`);
  return errors.length ? { BH: "B\"H", ok: false, error: "tunnel_response_correlation_mismatch", expected, actual: snapshot(result), mismatchProof: errors, rawMismatchedResponse: result } : result;
}

function snapshot(result = {}) {
  return { action: result.action, requestAction: result.requestAction, actualAction: result.actualAction, clientRequestId: result.clientRequestId, controlRequestId: result.controlRequestId, jobId: result.jobId, stream: result.stream, path: result.path, absolutePath: result.absolutePath };
}

function allowedActionAlias(expected, actual) {
  if (expected === actual) return true;
  const aliases = { command: ["command", "commandRun", "commandStart"], commandRun: ["command", "commandRun", "commandStart"], commandWait: ["commandWait", "commandStatus"], commandJobOutputPage: ["commandJobOutputPage"], commandStatus: ["commandStatus"], nodeCheckFiles: ["nodeCheckFiles", "nodeCheckMany"], nodeCheckMany: ["nodeCheckFiles", "nodeCheckMany"] };
  return (aliases[expected] || []).includes(actual);
}
