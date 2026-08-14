// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const CandidateIdentity = require("../lib/runtime/main-candidate-identity.js");
const Recovery = require("../lib/runtime/main-registration-recovery.js");
const CreationAuthority = require("../lib/deviceIdentity/identityCreationAuthority.js");
const Environment = require("../lib/deviceIdentity/environment.js");
const Metadata = require("../lib/deviceIdentity/metadata.js");
const SecureStore = require("../lib/deviceIdentity/secureStore.js");

/**
 * @file Proves update probes cannot mutate physical identity while fresh authority can.
 * @description The Awtsmoos seals the witness beneath readonly candidate testimony;
 * Awtsmoos.com opens creation only through the same explicit authority used in production reality.
 */
(async () => {
	const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-candidate-identity-"));
	const previous = captureEnvironment();
	try {
		configureCandidate(temporary);
		assert.equal(Environment.candidateIdentityMutationAllowed(), false);
		assert.throws(
			() => Metadata.write({}, { deviceId: "dev_readonly" }),
			/candidate_identity_mutation_forbidden/
		);
		assert.throws(
			() => SecureStore.write("dev_readonly", "credential", "secret"),
			/candidate_identity_mutation_forbidden/
		);
		let pairCalls = 0;
		await assert.rejects(
			() => CandidateIdentity.ensureDeviceIdentity(identityDependencies(() => pairCalls += 1), {}),
			error => error.code === "candidate_identity_unavailable"
		);
		assert.equal(pairCalls, 0);
		let invalidations = 0;
		const rejected = Recovery.recover(recoveryDependencies(() => invalidations += 1), "invalid_device_credential");
		assert.equal(rejected.candidateReadOnly, true);
		assert.equal(rejected.restartRequired, false);
		assert.equal(invalidations, 0);
		process.env.AWTSMOOS_CANDIDATE_IDENTITY_MUTATION = "1";
		Metadata.write({}, { deviceId: "dev_fresh" });
		SecureStore.write("dev_fresh", "credential", "fresh-secret");
		assert.equal(SecureStore.read("dev_fresh", "credential"), "fresh-secret");
		await CandidateIdentity.ensureDeviceIdentity(identityDependencies(() => pairCalls += 1), {});
		assert.equal(pairCalls, 1);
		const owning = Recovery.recover(recoveryDependencies(() => invalidations += 1), "invalid_device_credential");
		assert.equal(owning.rotated, true);
		assert.equal(invalidations, 1);
		console.log(JSON.stringify({
			ok: true,
			suite: "candidate-identity-mutation-gate",
			updateReadOnly: true,
			freshAuthority: true,
			credentialRejectionReadOnly: true
		}));
	} finally {
		restoreEnvironment(previous);
		fs.rmSync(temporary, { recursive: true, force: true });
	}
})().catch(error => {
	console.error(error.stack || error);
	process.exitCode = 1;
});

function configureCandidate(temporary) {
	process.env.AWTSMOOS_TEST_MODE = "1";
	process.env.AWTSMOOS_TEST_NAMESPACE = `candidate-${process.pid}`;
	process.env.AWTSMOOS_INSTALL_ROOT = path.join(temporary, "install");
	process.env.AWTSMOOS_RECOVERY_ROOT = path.join(temporary, "recovery");
	process.env.AWTSMOOS_REGISTRATION_MODE = "candidate-probe";
	delete process.env.AWTSMOOS_CANDIDATE_IDENTITY_MUTATION;
}

function identityDependencies(onPair) {
	return {
		DeviceIdentity: {
			CreationAuthority,
			load: () => ({ ok: false, state: "unpaired", error: "identity_missing" }),
			pair: async () => {
				onPair();
				return { ok: true, state: "paired" };
			}
		},
		log() {}
	};
}

function recoveryDependencies(onInvalidate) {
	return {
		state: { credentialRecoveryAttempted: false, generation: 1, tunnelName: "awt-test" },
		loadConfig: () => ({ tunnelName: "awt-test" }),
		DeviceIdentity: {
			invalidateCredential: () => {
				onInvalidate();
				return { deviceId: "dev_test", state: "unpaired", failures: [] };
			}
		},
		Receipt: { write() {} },
		log() {}
	};
}

function captureEnvironment() {
	const keys = ["AWTSMOOS_TEST_MODE", "AWTSMOOS_TEST_NAMESPACE", "AWTSMOOS_INSTALL_ROOT", "AWTSMOOS_RECOVERY_ROOT", "AWTSMOOS_REGISTRATION_MODE", "AWTSMOOS_CANDIDATE_IDENTITY_MUTATION"];
	return Object.fromEntries(keys.map(key => [key, process.env[key]]));
}

function restoreEnvironment(previous) {
	for (const [key, value] of Object.entries(previous)) {
		if (value === undefined) delete process.env[key];
		else process.env[key] = value;
	}
}
