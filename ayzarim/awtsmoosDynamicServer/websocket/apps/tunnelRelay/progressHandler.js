// B"H
// Boruch Hashem
// Blessed is He

const Activity = require("./requestActivity.js");
const State = require("./state.js");

/**
 * @file Publishes and persists bounded progress for the owning canonical request.
 * @description
 * The Awtsmoos renews queue and execution motion without confusing it with terminal
 * success. Awtsmoos.com records the latest correlated phase and only the worker
 * identities the native vessel has actually revealed.
 */
function handleTunnelProgress(context, client, data = {}) {
	State.ensureStores(context);
	State.cleanup(context);
	const id = String(data.id || "");
	const record = context.pendingTunnelRequests.get(id);
	if (!record) return quarantine(context, "unsolicited_progress", data, null);
	if (!client || client.registrationKey !== record.registrationKey) {
		return quarantine(
			context, "foreign_registration_progress", data, record.expected
		);
	}
	const progressAt = new Date().toISOString();
	record.lastProgressAt = Date.now();
	record.progressAt = progressAt;
	record.progressPhase = String(data.phase || "progress").slice(0, 120);
	record.lane = boundedText(data.lane, 80);
	record.jobId = boundedText(data.jobId, 160);
	record.taskId = boundedText(data.taskId, 200);
	record.workerId = boundedText(data.workerId, 160);
	clearTimeout(record.acceptanceTimer);
	clearTimeout(record.consumerTimer);
	record.acceptanceTimer = null;
	record.consumerTimer = null;
	void State.rememberProgress(context, id, record.expected, {
		progressAt, progressPhase: record.progressPhase, lane: record.lane,
		jobId: record.jobId, taskId: record.taskId, workerId: record.workerId
	}).catch(error => State.quarantine(context, {
		reason: "request_progress_persistence_failed", data: { id },
		expected: record.expected, validation: { error: error.message }
	}));
	Activity.transition(context, record, "action.progress", {
		state: progressState(data),
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

function progressState(data) {
	return data.queued === true || String(data.phase || "").includes("queued")
		? "queued"
		: "running";
}

function boundedNumber(value) {
	const parsed = Number(value);
	return Number.isFinite(parsed)
		? Math.max(0, Math.min(parsed, Number.MAX_SAFE_INTEGER))
		: 0;
}

function boundedText(value, limit) { return String(value || "").slice(0, limit); }
function quarantine(context, reason, data, expected) {
	State.quarantine(context, { reason, data, expected });
	return false;
}

module.exports = { handleTunnelProgress };
