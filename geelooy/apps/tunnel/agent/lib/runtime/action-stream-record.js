// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const Correlation = require("./correlation-scope.js");

/**
 * @file Normalizes action-stream testimony into compact durable rows.
 * @description The Awtsmoos turns many transient runtime moments into one stable language; Awtsmoos.com keeps identity without carrying entire payloads.
 */
let localSequence = 0;

function normalizeEvent(config = {}, event = {}) {
	const payload = event.payload || event.input || {};
	const scope = Correlation.extractCorrelationScope(payload);
	const now = new Date().toISOString();
	const phase = String(event.phase || event.type || "action.event");
	const action = String(event.action || payload.action || event.requestAction || "unknown");
	return clean({
		eventId: event.eventId || id("evt"),
		phase,
		type: phase,
		action,
		kind: event.kind || payload.kind || "",
		requestAction: event.requestAction || payload.requestAction || action,
		actualAction: event.actualAction || payload.actualAction || "",
		ok: event.ok,
		status: event.status,
		error: event.error,
		message: event.message,
		lane: event.lane,
		queuedMs: numberOrNull(event.queuedMs),
		runtimeMs: numberOrNull(event.runtimeMs),
		createdAt: event.createdAt || now,
		source: event.source || "tunnel-agent",
		tunnelName: scope.tunnelName || config.tunnelName || "",
		deviceName: scope.deviceName || "",
		projectRoot: scope.projectRoot || config.root || "",
		workspaceId: scope.workspaceId || "",
		agentSessionId: scope.agentSessionId || "",
		logicalAgentId: scope.logicalAgentId || "",
		conversationId: scope.conversationId || "",
		conversationName: scope.conversationName || "",
		missionId: scope.missionId || "",
		roomId: scope.roomId || "",
		leaseId: scope.leaseId || "",
		workerId: event.workerId || scope.workerId || event.result?.workerId || "",
		jobId: event.jobId || scope.jobId || event.result?.jobId || "",
		receiptId: event.receiptId || scope.receiptId || event.result?.receiptId || event.result?.receipt?.receiptId || "",
		actionId: event.actionId || scope.actionId || event.result?.actionId || "",
		controlRequestId: scope.controlRequestId || "",
		clientRequestId: scope.clientRequestId || "",
		traceId: scope.traceId || "",
		spanId: scope.spanId || "",
		parentActionId: scope.parentActionId || "",
		payloadKeys: Object.keys(payload).sort().slice(0, 80),
		resultSummary: summarizeResult(event.result)
	});
}

function summarizeResult(result) {
	if (!result || typeof result !== "object") return undefined;
	return clean({ ok: result.ok, action: result.action, status: result.status, error: result.error, jobId: result.jobId, workerId: result.workerId, receiptId: result.receiptId || result.receipt?.receiptId, actionId: result.actionId, outputRef: result.outputRef, inputRef: result.inputRef });
}

function id(prefix) {
	localSequence = (localSequence + 1) % 1000000;
	return `${prefix}_${Date.now().toString(36)}_${process.pid}_${localSequence}_${crypto.randomBytes(3).toString("hex")}`;
}

function clean(object = {}) {
	return Object.fromEntries(Object.entries(object).filter(([, value]) => value !== undefined && value !== null && value !== ""));
}

function numberOrNull(value) {
	const number = Number(value);
	return Number.isFinite(number) ? number : undefined;
}

module.exports = { normalizeEvent };
