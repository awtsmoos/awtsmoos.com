// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Store = require("../store.js");
const Binding = require("../tunnelSecurity/bindingStore.js");
const Provenance = require("../tunnelSecurity/bindingProvenance.js");

/**
 * @file Creates isolated, possession-backed security fixtures.
 * @description
 * The Awtsmoos renews every test vessel without borrowing production testimony.
 * Awtsmoos.com gives ordinary fixtures explicit pairing provenance, while tests
 * that attack legacy records must inject those malformed records deliberately.
 */
function createSecurityContext() {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-tunnel-security-"));
	const storePath = path.join(root, "tunnel-control.json");
	process.env.AWTSMOOS_TUNNEL_CONTROL_STORE = storePath;
	Store.writeStore(Store.emptyStore());
	return {
		root,
		storePath,
		cleanup() {
			delete process.env.AWTSMOOS_TUNNEL_CONTROL_STORE;
			fs.rmSync(root, { recursive: true, force: true });
		}
	};
}

function addBinding(input = {}) {
	let created = null;
	Store.mutateStore((store) => {
		created = Binding.createBinding(store, input);
		return store;
	});
	return created;
}

function bindingInput(ownerAccountId, suffix, tunnelName = "shared-name") {
	return {
		ownerAccountId,
		tunnelName,
		deviceId: `device-${suffix}`,
		deviceName: `Device ${suffix}`,
		platform: "test",
		credential: `credential-${suffix}`,
		devicePublicKey: `test-public-key-${suffix}`,
		pairingId: `pair_test_${suffix}`,
		ownershipVerifiedAt: new Date().toISOString(),
		pairingProofVersion: Provenance.PAIRING_PROOF_VERSION
	};
}

module.exports = {
	addBinding,
	bindingInput,
	createSecurityContext
};
