// B"H
// Boruch Hashem
// Blessed is He

const IdentityRecovery = require("./identityRecovery.js");
const RecoveryLog = require("./recoveryLog.js");
const State = require("./stateStore.js");

/**
 * @file Gates identity mutation behind a durable policy request.
 * @description
 * The Awtsmoos permits inspection only when evidence asks for inspection, and
 * permits reset only when evidence asks for reset. Awtsmoos.com never destroys
 * a coherent covenant merely because unrelated runtime testimony was incomplete.
 */
function run(root, reason = "", forceReset = false) {
	const current = State.read(root);
	if (!repairRequested(current, forceReset)) {
		return skip(root, current, reason);
	}
	const repair = IdentityRecovery.inspect(root, reason, {
		forceReset: forceReset === true || current.identityResetRequired === true,
		failureCode: current.identityRepairReason || reason
	});
	const state = State.update(root, value => State.append({
		...value,
		identityInspectionRequired: false,
		identityResetRequired: false,
		identityRepairReason: "",
		identityRepairAttempts: Number(value.identityRepairAttempts || 0) + 1,
		lastIdentityRepairAt: new Date().toISOString(),
		lastIdentityRepairState: repair.state
	}, event("identity_repair", repair, reason)));
	writeLog(root, repair, state, reason);
	return { ok: true, repair: publicRepair(repair), state };
}

function repairRequested(state = {}, forceReset = false) {
	return forceReset === true ||
		state.identityInspectionRequired === true ||
		state.identityResetRequired === true;
}

function skip(root, state, reason) {
	const repair = {
		ok: true,
		state: "identity_repair_not_required",
		changed: false,
		reason
	};
	RecoveryLog.append(root, "recovery.log", {
		type: "identity_repair_skipped",
		repair,
		state
	});
	return { ok: true, repair, state };
}

function event(type, repair, reason) {
	return { type, state: repair.state, changed: repair.changed, reason };
}

function writeLog(root, repair, state, reason) {
	RecoveryLog.append(root, "recovery.log", {
		type: "identity_repair",
		repair: publicRepair(repair),
		state,
		reason
	});
}

function publicRepair(repair = {}) {
	return {
		ok: repair.ok === true,
		state: repair.state || "unknown",
		changed: repair.changed === true,
		reason: repair.reason || "",
		deviceId: repair.deviceId || null,
		fingerprint: repair.fingerprint || null,
		evidencePath: repair.evidencePath || null
	};
}

module.exports = { publicRepair, repairRequested, run };
