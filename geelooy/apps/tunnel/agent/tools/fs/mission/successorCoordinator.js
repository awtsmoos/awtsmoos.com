// B"H
// Boruch Hashem
// Blessed is He

const Mission = require("./index.js");
const Continuity = require("./continuity.js");
const Eligibility = require("./successorEligibility.js");
const Identity = require("./successorIdentity.js");
const Ledger = require("./successorLedger.js");
const Selection = require("./successorSelection.js");
const Activation = require("./successorActivation.js");

/**
 * @file Reserves successor custody before activation and safely resumes interrupted handoff.
 * @description
 * The Awtsmoos places memory before motion: Awtsmoos.com saves who should inherit before
 * any browser or room activation may arise, then returns terminal ledger evidence unchanged
 * on replay so an already-issued or suppressed handoff can never be accidentally reborn.
 */
async function reserve(config, payload, completionEvent) {
	const mission = await Mission.load(config, payload.missionId);
	if (!mission) {
		return { ok: false, error: "mission_not_found" };
	}
	const predecessorId = Identity.predecessorId(payload);
	const terminalKey = Identity.terminalKey(mission.id, predecessorId, completionEvent);
	const existing = Ledger.find(mission, terminalKey);
	if (existing) {
		return existingReservation(existing);
	}
	const eligibility = Eligibility.evaluate(
		mission,
		payload,
		Continuity.court(mission),
		Continuity.recovery(mission)
	);
	if (!eligibility.eligible || Ledger.loopBlocked(mission, eligibility.fingerprint)) {
		return suppress(config, mission, predecessorId, terminalKey, eligibility);
	}
	const activation = Activation.plan(
		mission,
		predecessorId,
		terminalKey,
		eligibility.work
	);
	let roomReceipt = null;
	if (activation.mode === "room") {
		roomReceipt = Selection.prepareRoom(
			mission,
			predecessorId,
			terminalKey,
			eligibility.work
		);
		Object.assign(activation, roomReceipt);
	}
	const record = Ledger.reserve(mission, {
		terminalKey,
		predecessorId,
		workFingerprint: eligibility.fingerprint,
		reason: eligibility.reason,
		work: eligibility.work,
		activation,
		successorId: activation.successorId,
		reused: roomReceipt?.reused
	});
	await Mission.save(config, mission);
	return { ok: true, record: Ledger.compact(record), activate: record };
}

function existingReservation(record) {
	const resumable = ["reserved", "activation_failed"].includes(record.state) &&
		Boolean(record.activation);
	return {
		ok: true,
		record: Ledger.compact(record),
		activate: resumable ? record : null,
		replayed: true
	};
}

async function suppress(config, mission, predecessorId, terminalKey, eligibility) {
	const reason = eligibility.eligible
		? "successor_blocked_review"
		: eligibility.reason;
	const record = Ledger.reserve(mission, {
		terminalKey,
		predecessorId,
		workFingerprint: eligibility.fingerprint,
		reason,
		work: eligibility.work
	});
	Ledger.finish(mission, record, "suppressed", reason);
	await Mission.save(config, mission);
	return { ok: true, record: Ledger.compact(record), activate: null };
}

async function finalize(config, missionId, terminalKey, activation) {
	const mission = await Mission.load(config, missionId);
	const record = mission && Ledger.find(mission, terminalKey);
	if (!mission || !record) {
		return { ok: false, error: "successor_reservation_missing" };
	}
	if (record.state === "issued" || record.state === "suppressed") {
		return { ok: true, record: Ledger.compact(record), replayed: true };
	}
	if (activation.ok) {
		Ledger.issued(mission, record, activation);
	} else {
		Ledger.finish(mission, record, "activation_failed", "successor_activation_failed");
	}
	await Mission.save(config, mission);
	return { ok: activation.ok, record: Ledger.compact(record) };
}

module.exports = {
	existingReservation,
	finalize,
	reserve
};
