// B"H

/**
 * B"H — Chapter 1977: preview links now bow to the small response vow.
 * Core transport and result fields survive. Preview fields survive only when
 * debug is requested or a preview was explicitly required.
 */
const PREVIEW_KEYS = new Set(["createdPreview","previewId","viewUrl","rawUrl","wsUrl","url","createUrl","previewLinks","previewInstruction","previewDisplayHint"]);
const CORE_KEYS = new Set(["BH","ok","status","error","message","note","diagnostics","action","actualAction","requestAction","actionMismatch","type","id","tunnelName","requestedTunnelName","vessel","routeReason","queuedMs","queueStats","lane","controlRequestId","clientRequestId","conversationId","conversationName","agentSessionId","logicalAgentId","missionId","projectRoot","targetVessel","nonce","jobId","stream","running","done","exitCode","signal","timedOut","statusPayload","waitPayload","stdoutPagePayload","stderrPagePayload","content","content64","stdout","stderr","files","order","items","detailedItems","results","result","record","history","timeline","count","returnedCount","totalChars","returnedChars","hasNextPage","nextPagePayload","nextOffsetChars","responseMode","externalized","outputRef","resultRef","inputRef","contentUrl","handoffUrl","ephemeral","expiresAt","expiresInSeconds","bytes","sha256","summary","inline","originalBytes","links","artifacts","responseFocus","previewPolicy","previewRequired","awtsmoosNext","mustCallNext","mustContinue","finalAnswerAllowed","multipleChoiceSelfInterrogation","allCapsPrompt","acceptedAnswerFormat","aiInstructions"]);
for (const key of PREVIEW_KEYS) CORE_KEYS.add(key);
function pruneTunnelResponse(result = {}, payload = {}) {
  if (!result || typeof result !== "object" || wantsDebug(payload)) return result;
  const out = {};
  const keepPreview = previewExplicit(payload, result);
  for (const key of Object.keys(result)) if (CORE_KEYS.has(key) && (keepPreview || !PREVIEW_KEYS.has(key))) out[key] = result[key];
  if (result.ok === false && !out.diagnostics) out.diagnostics = compactDiagnostics(result);
  if (keepPreview) preservePreviewShortcut(result, out);
  if (keepPreview && (out.previewLinks?.length || out.viewUrl || out.createdPreview)) out.responseFocus = { ...(out.responseFocus || {}), previewRequired:true };
  else if (out.responseFocus?.previewRequired === true && result.previewRequired === false) out.responseFocus = { ...out.responseFocus, previewRequired:false };
  return out;
}
function wantsDebug(payload = {}) { return payload.guidanceDebug === true || payload.guidanceDebug === "true" || payload.responseMode === "debug" || payload.responseMode === "full"; }
function previewExplicit(payload = {}, result = {}) {
  if (payload.autoPreview === true || payload.autoPreview === "true") return true;
  if (payload.humanPreview === true || payload.humanPreview === "true") return true;
  if (payload.previewRequired === true || payload.previewRequired === "true") return true;
  if (result.previewRequired === true && result.previewPolicy?.enabled !== false) return true;
  if (result.responseFocus?.previewRequired === true && result.previewPolicy?.enabled !== false && result.previewRequired !== false) return true;
  return false;
}
function preservePreviewShortcut(result, out) {
  const preview = result.createdPreview;
  if (!preview || typeof preview !== "object") return;
  const viewUrl = preview.viewUrl || preview.url || out.viewUrl;
  if (!viewUrl) return;
  out.viewUrl = out.viewUrl || viewUrl;
  out.rawUrl = out.rawUrl || preview.rawUrl || result.rawUrl || "";
  out.wsUrl = out.wsUrl || preview.wsUrl || result.wsUrl || "";
  out.previewDisplayHint = out.previewDisplayHint || preview.previewDisplayHint || preview.source?.previewDisplayHint || "";
  if (Array.isArray(out.previewLinks) && out.previewLinks.length) return;
  out.previewLinks = [{ id:preview.id || result.previewId || "", title:preview.title || "Awtsmoos preview", kind:preview.kind || "preview", visibility:preview.visibility || "private", viewUrl, rawUrl:out.rawUrl, wsUrl:out.wsUrl, accessSummary:preview.accessSummary || "", expiresAt:preview.expiresAt, previewDisplayHint:out.previewDisplayHint }];
  out.previewInstruction = out.previewInstruction || `Open ${viewUrl}.`;
}
function compactDiagnostics(result = {}) { return { routeReason:result.routeReason, tunnelName:result.tunnelName, mismatchProof:result.mismatchProof, expected:result.expected, actual:result.actual }; }
module.exports = { pruneTunnelResponse, CORE_KEYS, PREVIEW_KEYS, previewExplicit };
