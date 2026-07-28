// B"H
// Boruch Hashem
// Blessed is He

const Activity = require("./requestActivity.js");
const State = require("./state.js");

/**
* @file Publishes bounded agent progress only for the owning pending request.
* @description
* The Awtsmoos renews waiting, lane, and motion without weakening correlation.
* Awtsmoos.com lets the rightful tunnel testify that work is queued or running,
* while foreign sockets and guessed IDs remain quarantined outside the account stream.
*/

/** Validates one progress frame and publishes a nonterminal action transition. */
function handleTunnelProgress(context, client, data = {}) {
	State.ensureStores(context);
	State.cleanup(context);
	const id = String(data.id || "");
	const record = context.pendingTunnelRequests.get(id);
	if (!record) {
		return quarantine(context, "unsolicited_progress", data, null);
	}
	if (!client || client.registrationKey !== record.registrationKey) {
		return quarantine(
			context,
			"foreign_registration_progress",
			data,
			record.expected
		);
	}
	record.lastProgressAt = Date.now();
	clearTimeout(record.acceptanceTimer);
	clearTimeout(record.consumerTimer);
	record.acceptanceTimer = null;
	record.consumerTimer = null;
	Activity.transition(context, record, "action.progress", {
		state: progressState(data),
		severity: "info",
		summary: `${record.activityContext.action} ${data.phase || "progress"}`,
		phase: String(data.phase || "progress").slice(0, 120),
		lane: String(data.lane || "").slice(0, 80),
		queuedMs: boundedNumber(data.queuedMs),
		queuePosition: boundedNumber(data.queuePosition),
		stillRunning: data.stillRunning !== false,
		message: String(data.message || "").slice(0, 320)
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

function quarantine(context, reason, data, expected) {
	State.quarantine(context, { reason, data, expected });
	return false;
}

module.exports = {
	handleTunnelProgress
};
