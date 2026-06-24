// B"H

const CORE_KEYS = new Set(["BH", "ok", "status", "error", "message", "action", "actualAction", "requestAction", "jobId", "stream", "statusPayload", "waitPayload", "stdoutPagePayload", "stderrPagePayload", "content", "content64", "files", "order", "results", "result", "count", "returnedCount", "totalChars", "returnedChars", "hasNextPage", "nextPagePayload", "responseFocus", "awtsmoosNext", "multipleChoiceSelfInterrogation", "allCapsPrompt", "acceptedAnswerFormat", "type", "controlRequestId", "clientRequestId", "nonce"]);

/**
 * B"H
 * Chapter 815: The response stopped dragging its whole wagon into the room.
 */
function pruneTunnelResponse(result = {}, payload = {}) {
  if (!result || typeof result !== "object" || payload.guidanceDebug === true || payload.guidanceDebug === "true") return result;
  const out = {};
  for (const key of Object.keys(result)) if (CORE_KEYS.has(key)) out[key] = result[key];
  if (result.ok === false) out.diagnostics = compactDiagnostics(result);
  return out;
}

function compactDiagnostics(result = {}) {
  return {
    routeReason: result.routeReason,
    tunnelName: result.tunnelName,
    mismatchProof: result.mismatchProof,
    expected: result.expected,
    actual: result.actual
  };
}

module.exports = { pruneTunnelResponse };
