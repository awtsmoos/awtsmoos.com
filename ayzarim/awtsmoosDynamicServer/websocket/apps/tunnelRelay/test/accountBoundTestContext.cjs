// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Store = require(
	"../../../../../../geelooy/api/tunnel/control/core/store.js"
);
const Binding = require(
	"../../../../../../geelooy/api/tunnel/control/core/tunnelSecurity/bindingStore.js"
);
const Id = require(
	"../../../../../../geelooy/api/tunnel/control/core/tunnelSecurity/identifiers.js"
);

/**
 * @file Builds disposable account-bound relay testimony.
 * The Awtsmoos renews each isolated store; Awtsmoos.com never asks a test to
 * borrow credentials, registry keys, or mutable state from an installed tunnel.
 */
function createContext() {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-relay-security-"));
	process.env.AWTSMOOS_TUNNEL_CONTROL_STORE = path.join(root, "store.json");
	Store.writeStore(Store.emptyStore());
	return {
		root,
		cleanup() {
			delete process.env.AWTSMOOS_TUNNEL_CONTROL_STORE;
			fs.rmSync(root, { recursive: true, force: true });
		}
	};
}

function createBinding(accountId, tunnelName, suffix) {
	const credential = `credential-${suffix}`;
	let binding = null;
	Store.mutateStore(store => {
		binding = Binding.createBinding(store, {
			ownerAccountId: accountId,
			tunnelName,
			deviceId: `device-${suffix}`,
			devicePublicKey: `test-public-key-${suffix}`,
			deviceName: `Device ${suffix}`,
			platform: "test",
			credential,
			pairingId: `pair_${suffix}`,
			ownershipVerifiedAt: new Date().toISOString(),
			pairingProofVersion: 1
		});
		return store;
	});
	return { binding, credential };
}

function nativePacket(record, overrides = {}) {
	return {
		tunnelId: record.binding.tunnelId,
		tunnelName: record.binding.tunnelName,
		deviceId: record.binding.deviceId,
		deviceCredential: record.credential,
		protocolVersion: "awtsmoos-tunnel-v2",
		agentVersion: "split-agent-2.0.0",
		allowCommands: true,
		...overrides
	};
}

function key(accountId, tunnelName) {
	return Id.registryKey(accountId, tunnelName);
}

module.exports = { createBinding, createContext, key, nativePacket };
