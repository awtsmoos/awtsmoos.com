// B"H
// Boruch Hashem
// Blessed is He

const Activity = require("./requestActivity.js");
const Evidence = require("./consumerProgressEvidence.js");
const ConsumerWatchdog = require("./requestConsumerWatchdog.js");
const State = require("./state.js");

/**
 * @file Persists progress without confusing queue custody with consumer execution.
 * @description
 * The Awtsmoos renews waiting and running as different truths. Awtsmoos.com keeps
 * strict v2 fencing alive through a truthful queue heartbeat, then releases that
 * fence only when a real handler or worker proves that consumption has begun.
 */
function handleTunnelProgress(context, client, data = {}) {
	State.ensureStores(context);
	State.cleanup(context);
	const id = String(data.id || "");
	const record = context.pendingTunnelRequests.get(id);
	if (!record) return quarantine(context, "unsolicited_progress", data, null);
	if (!client || client.registrationKey !== record.registrationKey) {
		return quarantine(
			context,
			"foreign_registration_progress",
			data,
			record.expected
		);
	}
	const observedAt = Date.now();
	const progressAt = new Date(observedAt).toISOString();
	const evidence = Evidence.observe(data, observedAt);
	record.lastProgressAt = observedAt;
	record.progressAt = progressAt;
	record.progressPhase = evidence.phase || "progress";
	record.lane = boundedText(data.lane, 80);
	record.jobId = boundedText(data.jobId, 160);
	record.taskId = boundedText(data.taskId, 200);
	record.workerId = boundedText(data.workerId, 160);
	record.consumerEvidence = evidence;
	if (evidence.consumerStarted) {
		record.consumerStartedAt ||= observedAt;
		clearTimeout(record.consumerTimer);
		record.consumerTimer = null;
	} else if (evidence.queued) {
		ConsumerWatchdog.armForEvidence(context, client, id, record, evidence);
	}
	void State.rememberProgress(context, id, record.expected, {
		progressAt,
		progressPhase: record.progressPhase,
		lane: record.lane,
		jobId: record.jobId,
		taskId: record.taskId,
		workerId: record.workerId
	}).catch(error => State.quarantine(context, {
		reason: "request_progress_persistence_failed",
		data: { id },
		expected: record.expected,
		validation: { error: error.message }
	}));
	Activity.transition(context, record, "action.progress", {
		state: progressState(evidence),
		severity: "info",
		summary: `${record.activityContext?.action || "action"} ${record.progressPhase}`,
		phase: record.progressPhase,
		lane: record.lane,
		queuedMs: boundedNumber(data.queuedMs),
		queuePosition: boundedNumber(data.queuePosition),
		stillRunning: data.stillRunning !== false,
		message: boundedText(data.message, 320)
	});
	return true;
}

function progressState(evidence = {}) {
	if (evidence.consumerStarted) return "running";
	return evidence.queued ? "queued" : "progressing";
}

function boundedNumber(value) {
	const parsed = Number(value);
	return Number.isFinite(parsed)
		? Math.max(0, Math.min(parsed, Number.MAX_SAFE_INTEGER))
		: 0;
}

function boundedText(value, limit) {
	return String(value || "").slice(0, limit);
}

function quarantine(context, reason, data, expected) {
	State.quarantine(context, { reason, data, expected });
	return false;
}

module.exports = {
	boundedNumber,
	boundedText,
	handleTunnelProgress,
	progressState
};
