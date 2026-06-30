// B"H

/**
 * B"H
 * Chapter 815: The response learned to travel light without losing its soul.
 *
 * A tunnel answer may carry a mountain, but the agent needs the burning letters
 * at the summit: what happened, what to call next, where the preview lives, and
 * which correlation thread belongs to this exact breath of work. The pruner is
 * therefore not a shredder. It is a faithful gatekeeper: it removes hay, never
 * the needle.
 */
const CORE_KEYS = new Set([
  "BH", "ok", "status", "error", "message", "note", "diagnostics",
  "action", "actualAction", "requestAction", "actionMismatch", "type", "id",
  "tunnelName", "requestedTunnelName", "vessel", "routeReason", "queuedMs", "queueStats",
  "controlRequestId", "clientRequestId", "conversationId", "conversationName",
  "agentSessionId", "logicalAgentId", "missionId", "projectRoot", "targetVessel", "nonce",
  "jobId", "stream", "running", "done", "exitCode", "signal", "timedOut",
  "statusPayload", "waitPayload", "stdoutPagePayload", "stderrPagePayload",
  "content", "content64", "stdout", "stderr", "files", "order", "items", "detailedItems",
  "results", "result", "record", "history", "timeline", "count", "returnedCount",
  "totalChars", "returnedChars", "hasNextPage", "nextPagePayload", "nextOffsetChars",
  "responseMode", "externalized", "outputRef", "resultRef", "inputRef", "contentUrl",
  "handoffUrl", "ephemeral", "expiresAt", "expiresInSeconds", "bytes", "sha256",
  "summary", "inline", "originalBytes",
  "createdPreview", "previewId", "viewUrl", "rawUrl", "wsUrl", "url", "createUrl",
  "previewLinks", "previewInstruction", "links", "artifacts",
  "responseFocus", "awtsmoosNext", "mustCallNext", "mustContinue", "finalAnswerAllowed",
  "multipleChoiceSelfInterrogation", "allCapsPrompt", "acceptedAnswerFormat", "aiInstructions"
]);

function pruneTunnelResponse(result = {}, payload = {}) {
  if (!result || typeof result !== "object" || wantsDebug(payload)) return result;
  const out = {};
  for (const key of Object.keys(result)) if (CORE_KEYS.has(key)) out[key] = result[key];
  if (result.ok === false && !out.diagnostics) out.diagnostics = compactDiagnostics(result);
  preservePreviewShortcut(result, out);
  return out;
}

function wantsDebug(payload = {}) {
  return payload.guidanceDebug === true || payload.guidanceDebug === "true";
}

function preservePreviewShortcut(result, out) {
  if (Array.isArray(out.previewLinks) && out.previewLinks.length) return;
  const preview = result.createdPreview;
  if (!preview || typeof preview !== "object") return;
  const viewUrl = preview.viewUrl || preview.url;
  if (!viewUrl) return;
  out.previewLinks = [{
    id: preview.id || result.previewId || "",
    title: preview.title || "Awtsmoos preview",
    kind: preview.kind || "preview",
    visibility: preview.visibility || "private",
    viewUrl,
    rawUrl: preview.rawUrl || result.rawUrl || "",
    accessSummary: preview.accessSummary || ""
  }];
  out.previewInstruction = out.previewInstruction || `Open ${viewUrl}.`;
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

module.exports = { pruneTunnelResponse, CORE_KEYS };
