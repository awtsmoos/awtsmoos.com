// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Fixture = require("./physicalIdentityContinuityFixture.cjs");
const Metadata = require("../lib/deviceIdentity/metadata.js");
const Pairing = require("../lib/deviceIdentity/pairingWorkflow.js");
const CandidateIdentity = require("../lib/runtime/main-candidate-identity.js");

/**
 * @file Proves restart, corrupt storage, and pairing failure cannot silently replace a physical witness.
 * @description
 * The Awtsmoos renews the route while Awtsmoos.com preserves the witness through every trial;
 * only explicit creation authority may kindle a new device, while ordinary failure stays denial.
 */
(async () => {
	const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-continuity-"));
	const previous = Fixture.captureEnvironment();
	try {
		Fixture.configurePaths(temporary);
		assert.throws(
			() => Metadata.loadOrCreate({}),
			error => error.code === "identity_recovery_required"
		);
		assert.equal(Fixture.bindingExists(temporary), false);
		proveCorruptionFailsClosed(temporary);
		await proveStartupCreationAuthority();
		await proveCredentialRenewalSkipsCreation();
		await proveRecoverablePairingPreservesWitness(temporary);
		console.log(JSON.stringify({ ok: true, suite: "physical-identity-continuity-gate" }));
	} finally {
		Fixture.restoreEnvironment(previous);
		fs.rmSync(temporary, { recursive: true, force: true });
	}
})().catch(error => {
	console.error(error.stack || error);
	process.exitCode = 1;
});

function proveCorruptionFailsClosed(temporary) {
	const canonical = path.join(temporary, "recovery", "state", "device-binding.json");
	const mirror = path.join(temporary, "install", "device-binding.json");
	for (const target of [canonical, mirror]) {
		fs.mkdirSync(path.dirname(target), { recursive: true });
		fs.writeFileSync(target, "{broken", "utf8");
	}
	assert.throws(() => Metadata.read({}), error => error.code === "identity_metadata_invalid");
	Fixture.clearIdentityTrees(temporary);
}

async function proveStartupCreationAuthority() {
	let pairCalls = 0;
	const dependencies = fakeDependencies("unpaired", () => pairCalls += 1, () => {
		const error = new Error("identity_recovery_required:startup_pairing");
		error.code = "identity_recovery_required";
		throw error;
	});
	await assert.rejects(
		() => CandidateIdentity.ensureDeviceIdentity(dependencies, {}),
		error => error.code === "identity_recovery_required"
	);
	assert.equal(pairCalls, 0);
}

async function proveCredentialRenewalSkipsCreation() {
	let pairCalls = 0;
	const dependencies = fakeDependencies("credential_missing", () => pairCalls += 1, () => {
		throw new Error("creation_authority_must_not_be_checked");
	});
	await CandidateIdentity.ensureDeviceIdentity(dependencies, {});
	assert.equal(pairCalls, 1);
}

async function proveRecoverablePairingPreservesWitness(temporary) {
	process.env.AWTSMOOS_TEST_MODE = "1";
	process.env.AWTSMOOS_TEST_NAMESPACE = `continuity-${process.pid}`;
	const deviceId = "dev_preserve_me";
	Metadata.write({}, { deviceId, publicKey: "missing-private-key", credentialVersion: 1 });
	await assert.rejects(() => Pairing.pair({}, { openBrowser: false, log() {} }));
	assert.equal(Metadata.read({}).deviceId, deviceId);
	process.env.AWTSMOOS_TEST_MODE = "0";
	Fixture.clearIdentityTrees(temporary);
}

function fakeDependencies(state, onPair, assertCreationAllowed) {
	return {
		DeviceIdentity: {
			CreationAuthority: { assertCreationAllowed },
			load: () => ({ ok: false, state }),
			pair: async () => {
				onPair();
				return { ok: true, state: "paired" };
			}
		},
		log() {}
	};
}
