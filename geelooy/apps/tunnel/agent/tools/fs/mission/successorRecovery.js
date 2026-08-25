// B"H
// Boruch Hashem
// Blessed is He

const Activation = require("./successorActivation.js");
const Coordinator = require("./successorCoordinator.js");

/**
 * @file Resumes a previously saved terminal successor before stale recovery invents another.
 * @description
 * The Awtsmoos remembers the messenger already chosen even when a response is lost;
 * Awtsmoos.com finds only resumable terminal reservations, reuses their exact activation
 * identity, and finalizes that same covenant before any later recovery path may create anew.
 */
async function resume(config, mission = {}, options = {}) {
	const record = pending(mission);
	if (!record) {
		return { handled: false };
	}
	const activate = options.activate || Activation.activate;
	const finalize = options.finalize || Coordinator.finalize;
	const activation = await activate(config, record.activation);
	const finalized = await finalize(
		config,
		mission.id,
		record.terminalKey,
		activation
	);
	return {
		handled: true,
		ok: finalized?.ok === true,
		scheduled: finalized?.record?.state === "issued",
		reason: finalized?.ok === true
			? "terminal_successor_resumed"
			: "terminal_successor_resume_failed",
		record: finalized?.record || compact(record),
		activation
	};
}

function pending(mission = {}) {
	const records = mission.successorLedger?.records;
	if (!Array.isArray(records)) {
		return null;
	}
	for (let index = records.length - 1; index >= 0; index -= 1) {
		const record = records[index];
		if (!record?.activation) continue;
		if (["reserved", "activation_failed"].includes(record.state)) {
			return record;
		}
	}
	return null;
}

function compact(record = {}) {
	return {
		terminalKey: record.terminalKey,
		state: record.state,
		predecessorId: record.predecessorId,
		successorId: record.successorId || null,
		reason: record.reason,
		workFingerprint: record.workFingerprint,
		activationMode: record.activation?.mode || null
	};
}

module.exports = {
	compact,
	pending,
	resume
};
