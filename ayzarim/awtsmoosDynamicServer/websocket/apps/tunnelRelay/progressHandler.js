// B"H
// Boruch Hashem
// Blessed is He

const Activity = require("./requestActivity.js");
const Evidence = require("./consumerProgressEvidence.js");
const ConsumerWatchdog = require("./requestConsumerWatchdog.js");
const State = require("./state.js");

/**
 * @file Persists monotonic request progress without confusing queue delay with transport loss.
 * @description
 * The Awtsmoos renews each moment while truth already revealed is never made less true;
 * Awtsmoos.com therefore lets queued work become running, but never lets a late queue echo
 * demote a request whose consumer has already begun its living deed.
 */
function handleTunnelProgress(context, client, data = {}) {
	State.ensureStores(context);
	State.cleanup(context);
	const id = String(data.id || "");
	const record = context.pendingTunnelRequests.get(id);
	if (!record) return quarantine(context, "unsolicited_progress", data, null);
	if (!client || client.registrationKey !== record.registrationKey) {
		return quarantine(context, "foreign_registration_progress", data, record.expected);
	}
	const observedAt = Date.now();
	const progressAt = new Date(observedAt).toISOString();
	const observedEvidence = Evidence.observe(data, observedAt);
	const evidence = Evidence.merge(record.consumerEvidence, observedEvidence);
	record.lastProgressAt = observedAt;
	record.progressAt = progressAt;
	record.progressPhase = observedEvidence.phase || "progress";
	record.lane = boundedText(data.lane || record.lane, 80);
	record.jobId = boundedText(data.jobId || record.jobId, 160);
	record.taskId = boundedText(data.taskId || record.taskId, 200);
	record.workerId = boundedText(data.workerId || record.workerId, 160);
	record.consumerEvidence = evidence;
	updateConsumerWatchdog(context, client, id, record, evidence, observedAt);
	void remember(context, id, record, progressAt);
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

/** Makes consumer admission irreversible and arms waiting only before admission. */
function updateConsumerWatchdog(context, client, id, record, evidence, observedAt) {
	if (evidence.consumerStarted === true) {
		record.consumerStartedAt ||= observedAt;
		clearTimeout(record.consumerTimer);
		record.consumerTimer = null;
		return;
	}
	if (!record.consumerStartedAt && evidence.queued === true) {
		ConsumerWatchdog.armForEvidence(context, client, id, record, evidence);
	}
}

async function remember(context, id, record, progressAt) {
	try {
		await State.rememberProgress(context, id, record.expected, {
			progressAt,
			progressPhase: record.progressPhase,
			lane: record.lane,
			jobId: record.jobId,
			taskId: record.taskId,
			workerId: record.workerId
		});
	} catch (error) {
		State.quarantine(context, {
			reason: "request_progress_persistence_failed",
			data: { id },
			expected: record.expected,
			validation: { error: error.message }
		});
	}
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
	progressState,
	updateConsumerWatchdog
};
