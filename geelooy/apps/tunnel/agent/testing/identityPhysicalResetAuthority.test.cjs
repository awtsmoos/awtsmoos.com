// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const DeviceIdentity = require("../lib/deviceIdentity/index.js");
const IdentityRecovery = require("../recovery/identityRecovery.js");
const RepairController = require("../recovery/identityRepairController.js");
const Policy = require("../recovery/registrationFailurePolicy.js");
const State = require("../recovery/stateStore.js");

/**
 * @file Proves automatic recovery can inspect identity damage but cannot erase it.
 * @description
 * The Awtsmoos keeps possession continuity stronger than one transient Keychain read.
 * Awtsmoos.com may restore a verified standby automatically, while physical deletion
 * remains impossible until a fresh explicit reset argument crosses the controller.
 */
function main() {
	const classification = Policy.classify("identity_private_key_invalid");
	assert.equal(classification.requiresIdentityInspection, true);
	assert.equal(classification.requiresIdentityReset, false);
	assert.equal(classification.resetCandidate, true);

	const restore = patchDeviceIdentity();
	try {
		const automatic = IdentityRecovery.inspect("/isolated", "identity_private_key_invalid");
		assert.equal(automatic.state, "identity_recovery_required");
		assert.equal(automatic.changed, false);
		assert.equal(restore.resetCalls(), 0);
		const explicit = IdentityRecovery.inspect("/isolated", "operator_reset", {
			forceReset: true,
			skipStandby: true
		});
		assert.equal(explicit.state, "identity_reset");
		assert.equal(restore.resetCalls(), 1);
	} finally {
		restore.restore();
	}

	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-identity-authority-"));
	const originalInspect = IdentityRecovery.inspect;
	let forceObserved = null;
	try {
		State.write(root, {
			...State.defaults(),
			identityInspectionRequired: true,
			identityResetRequired: true,
			identityRepairReason: "identity_private_key_invalid"
		});
		IdentityRecovery.inspect = (_root, _reason, options) => {
			forceObserved = options.forceReset;
			return { ok: true, state: "identity_recovery_required", changed: false };
		};
		const repaired = RepairController.run(root, "identity_private_key_invalid", false);
		assert.equal(forceObserved, false);
		assert.equal(repaired.ok, false);
		assert.equal(repaired.state.identityResetRequired, false);
	} finally {
		IdentityRecovery.inspect = originalInspect;
		fs.rmSync(root, { recursive: true, force: true });
	}

	console.log(JSON.stringify({
		ok: true,
		suite: "identity-physical-reset-authority",
		automaticResetSuppressed: true,
		staleResetLatchSuppressed: true,
		explicitResetStillAvailable: true
	}, null, 2));
}

function patchDeviceIdentity() {
	const originals = {
		metadataRead: DeviceIdentity.Metadata.read,
		secureRead: DeviceIdentity.SecureStore.read,
		restore: DeviceIdentity.restoreHealthyIdentity,
		reset: DeviceIdentity.repairIdentity
	};
	let resets = 0;
	DeviceIdentity.Metadata.read = () => ({
		deviceId: "dev_fixture",
		publicKey: "fixture-public-key",
		publicKeyFingerprint: "fixture-fingerprint"
	});
	DeviceIdentity.SecureStore.read = () => "not-a-valid-private-key";
	DeviceIdentity.restoreHealthyIdentity = () => ({ changed: false, state: "slot_missing" });
	DeviceIdentity.repairIdentity = () => {
		resets += 1;
		return { ok: true, evidencePath: "/isolated/evidence.json" };
	};
	return {
		resetCalls: () => resets,
		restore() {
			DeviceIdentity.Metadata.read = originals.metadataRead;
			DeviceIdentity.SecureStore.read = originals.secureRead;
			DeviceIdentity.restoreHealthyIdentity = originals.restore;
			DeviceIdentity.repairIdentity = originals.reset;
		}
	};
}

main();
