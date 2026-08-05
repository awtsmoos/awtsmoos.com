// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Reveals the exact nonterminal phase of one canonical tunnel deed.
 * @description
 * The Awtsmoos creates reservation, dispatch, acceptance, and progress as distinct
 * vessels. Awtsmoos.com names only the evidence it has, so a waiting caller never
 * mistakes a durable server claim for device custody or living execution.
 */
function describe(record = {}) {
	const expected = record.expected || {};
	const dispatchedAt = timestamp(record.dispatchedAt || record.dispatchStartedAt);
	const deviceAcceptedAt = timestamp(
		record.acceptedAt || record.deviceAcceptedAt || record.requestAcceptedAt
	);
	const progressAt = timestamp(record.progressAt || record.lastProgressAt);
	const progressPhase = String(record.progressPhase || record.phaseDetail || "");
	const state = stateFor({ dispatchedAt, deviceAcceptedAt, progressAt, progressPhase });
	return compact({
		state,
		phase: state,
		reservationDurable: true,
		dispatched: Boolean(dispatchedAt),
		dispatchedAt,
		deviceAccepted: Boolean(deviceAcceptedAt),
		accepted: Boolean(deviceAcceptedAt),
		acceptedAt: deviceAcceptedAt,
		acceptanceDurable: Boolean(record.acceptedAt),
		progressing: Boolean(progressAt),
		progressAt,
		progressPhase,
		lane: record.lane || expected.lane,
		jobId: record.jobId || expected.jobId,
		taskId: record.taskId || expected.taskId,
		workerId: record.workerId || expected.workerId,
		unsafeToRedispatch: Boolean(dispatchedAt)
	});
}

function stateFor(evidence) {
	if (evidence.progressAt) {
		if (evidence.progressPhase.includes("waiting_for_consumer")) {
			return "device_accepted_waiting_for_consumer";
		}
		if (evidence.progressPhase.includes("queued")) return "queued_pending";
		return "running_pending";
	}
	if (evidence.deviceAcceptedAt) return "device_accepted_pending";
	if (evidence.dispatchedAt) return "dispatched_pending_acceptance";
	return "reserved_pending_dispatch";
}

function message(evidence = {}) {
	if (evidence.state === "reserved_pending_dispatch") {
		return "Request identity is reserved durably; device dispatch has not been proven.";
	}
	if (evidence.state === "dispatched_pending_acceptance") {
		return "Request was dispatched; device acceptance is not yet proven. Do not redispatch.";
	}
	if (evidence.state === "device_accepted_waiting_for_consumer") {
		return "Device accepted the request durably and is waiting for the execution consumer.";
	}
	if (evidence.state === "queued_pending") {
		return "Device accepted the request and queued it for bounded execution.";
	}
	if (evidence.state === "running_pending") {
		return "Device accepted the request and reported living execution progress.";
	}
	return "Device accepted the request; terminal completion is still pending.";
}

function timestamp(value) {
	if (!value) return "";
	if (typeof value === "number") return new Date(value).toISOString();
	return String(value);
}

function compact(value) {
	return Object.fromEntries(Object.entries(value).filter(([, item]) => (
		item !== undefined && item !== null && item !== ""
	)));
}

module.exports = { compact, describe, message, stateFor, timestamp };
