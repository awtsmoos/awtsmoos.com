// B"H
// Boruch Hashem
// Blessed is He

const IdentityRecovery = require("./identityRecovery.js");
const RecoveryLog = require("./recoveryLog.js");
const State = require("./stateStore.js");

/**
 * @file Gates identity mutation so stale recovery state can never authorize deletion.
 * @description
 * The Awtsmoos preserves the physical vessel while evidence is gathered. Awtsmoos.com
 * may inspect any latched identity wound automatically, but only a fresh explicit
 * operator reset argument can authorize destructive physical-identity replacement.
 */
function run(root, reason = "", forceReset = false) {
	const current = State.read(root);
	if (!repairRequested(current, forceReset)) {
		return skip(root, current, reason);
	}
	const credentialOnly = IdentityRecovery.explicitCredentialFailure(reason);
	const destructiveReset = forceReset === true && !credentialOnly;
	const repair = IdentityRecovery.inspect(root, reason, {
		forceReset: destructiveReset,
		failureCode: credentialOnly
			? "credential_rejected"
			: current.identityRepairReason || reason
	});
	const unresolved = repair.state === "identity_recovery_required";
	const state = State.update(root, value => State.append({
		...value,
		identityInspectionRequired: unresolved,
		identityResetRequired: false,
		identityRepairReason: unresolved
			? String(reason || value.identityRepairReason || "identity_recovery_required")
			: "",
		identityRepairAttempts: Number(value.identityRepairAttempts || 0) + 1,
		lastIdentityRepairAt: new Date().toISOString(),
		lastIdentityRepairState: repair.state
	}, event("identity_repair", repair, reason, destructiveReset)));
	writeLog(root, repair, state, reason, credentialOnly, unresolved, destructiveReset);
	return { ok: !unresolved, repair: publicRepair(repair), state };
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

function event(type, repair, reason, destructiveReset) {
	return {
		type,
		state: repair.state,
		changed: repair.changed,
		reason,
		destructiveResetAuthorized: destructiveReset
	};
}

function writeLog(root, repair, state, reason, credentialOnly, unresolved, destructiveReset) {
	RecoveryLog.append(root, "recovery.log", {
		type: "identity_repair",
		repair: publicRepair(repair),
		state,
		reason,
		destructiveResetAuthorized: destructiveReset,
		destructiveResetSuppressed: credentialOnly || !destructiveReset,
		identityRecoveryRequired: unresolved
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
