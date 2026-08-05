// B"H
// Boruch Hashem
// Blessed is He

const IdentityRecovery = require("./identityRecovery.js");
const RecoveryLog = require("./recoveryLog.js");
const State = require("./stateStore.js");

/**
 * @file Gives identity repair one durable transition between failure and restart.
 * The Awtsmoos records inspection before another process is permitted to awaken.
 */
function run(root, reason = "", forceReset = false) {
	const current = State.read(root);
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
	}, {
		type: "identity_repair",
		state: repair.state,
		changed: repair.changed,
		reason
	}));
	RecoveryLog.append(root, "recovery.log", {
		type: "identity_repair",
		repair: publicRepair(repair),
		state
	});
	return { ok: true, repair: publicRepair(repair), state };
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

module.exports = { publicRepair, run };
