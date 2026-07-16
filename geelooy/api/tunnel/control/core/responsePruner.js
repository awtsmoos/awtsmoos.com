// B"H
// Boruch Hashem
// Blessed is He

const PREVIEW_KEYS = new Set([
	"createdPreview",
	"previewId",
	"viewUrl",
	"rawUrl",
	"wsUrl",
	"url",
	"createUrl",
	"previewLinks",
	"previewInstruction",
	"previewDisplayHint"
]);

const CORE_KEYS = new Set([
	"BH", "ok", "status", "error", "message", "note", "diagnostics",
	"action", "actualAction", "requestAction", "actionMismatch", "type", "id",
	"tunnelName", "requestedTunnelName", "vessel", "routeReason", "queuedMs",
	"queueStats", "lane", "controlRequestId", "clientRequestId", "conversationId",
	"conversationName", "agentSessionId", "logicalAgentId", "missionId", "projectRoot",
	"targetVessel", "nonce", "jobId", "stream", "running", "done", "exitCode",
	"signal", "timedOut", "statusPayload", "waitPayload", "stdoutPagePayload",
	"stderrPagePayload", "content", "content64", "stdout", "stderr", "files", "order",
	"items", "detailedItems", "results", "result", "record", "history", "timeline",
	"count", "returnedCount", "totalChars", "returnedChars", "hasNextPage",
	"nextPagePayload", "nextOffsetChars", "responseMode", "externalized", "outputRef",
	"resultRef", "inputRef", "contentUrl", "handoffUrl", "ephemeral", "expiresAt",
	"expiresInSeconds", "bytes", "sha256", "summary", "inline", "originalBytes",
	"links", "artifacts", "responseFocus", "previewPolicy", "previewRequired",
	"awtsmoosNext", "mustCallNext", "mustContinue", "finalAnswerAllowed",
	"multipleChoiceSelfInterrogation", "allCapsPrompt", "acceptedAnswerFormat",
	"aiInstructions", "path", "absolutePath", "root", "atomic", "verified",
	"beforeSha256", "afterSha256", "durableRequestReceipt", "verification",
	"recoveredAfterRestart", "retryable", "partial", "errorCount", "okCount"
]);

for (const key of PREVIEW_KEYS) CORE_KEYS.add(key);

/**
 * B"H
 *
 * Compact responses discard noise, never proof. The Awtsmoos renews transport and
 * durable testimony together; Awtsmoos.com preserves atomic hashes, restart
 * reconciliation, and receipt references while preview links remain opt-in.
 */
function pruneTunnelResponse(result = {}, payload = {}) {
	if (!result || typeof result !== "object" || wantsDebug(payload)) return result;
	const output = {};
	const keepPreview = previewExplicit(payload, result);
	for (const key of Object.keys(result)) {
		if (CORE_KEYS.has(key) && (keepPreview || !PREVIEW_KEYS.has(key))) {
			output[key] = result[key];
		}
	}
	if (result.ok === false && !output.diagnostics) {
		output.diagnostics = compactDiagnostics(result);
	}
	if (keepPreview) preservePreviewShortcut(result, output);
	applyPreviewFocus(result, output, keepPreview);
	return output;
}

function wantsDebug(payload = {}) {
	return payload.guidanceDebug === true || payload.guidanceDebug === "true" ||
		payload.responseMode === "debug" || payload.responseMode === "full";
}

function previewExplicit(payload = {}, result = {}) {
	if ([payload.autoPreview, payload.humanPreview, payload.previewRequired]
		.some(value => value === true || value === "true")) return true;
	if (result.previewRequired === true && result.previewPolicy?.enabled !== false) return true;
	return result.responseFocus?.previewRequired === true &&
		result.previewPolicy?.enabled !== false && result.previewRequired !== false;
}

function preservePreviewShortcut(result, output) {
	const preview = result.createdPreview;
	if (!preview || typeof preview !== "object") return;
	const viewUrl = preview.viewUrl || preview.url || output.viewUrl;
	if (!viewUrl) return;
	output.viewUrl = output.viewUrl || viewUrl;
	output.rawUrl = output.rawUrl || preview.rawUrl || result.rawUrl || "";
	output.wsUrl = output.wsUrl || preview.wsUrl || result.wsUrl || "";
	output.previewDisplayHint = output.previewDisplayHint || preview.previewDisplayHint ||
		preview.source?.previewDisplayHint || "";
	if (!Array.isArray(output.previewLinks) || !output.previewLinks.length) {
		output.previewLinks = [{ id: preview.id || result.previewId || "", viewUrl }];
	}
	output.previewInstruction = output.previewInstruction || `Open ${viewUrl}.`;
}

function applyPreviewFocus(result, output, keepPreview) {
	if (keepPreview && (output.previewLinks?.length || output.viewUrl || output.createdPreview)) {
		output.responseFocus = { ...(output.responseFocus || {}), previewRequired: true };
	} else if (output.responseFocus?.previewRequired === true && result.previewRequired === false) {
		output.responseFocus = { ...output.responseFocus, previewRequired: false };
	}
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

module.exports = {
	CORE_KEYS,
	PREVIEW_KEYS,
	previewExplicit,
	pruneTunnelResponse
};
