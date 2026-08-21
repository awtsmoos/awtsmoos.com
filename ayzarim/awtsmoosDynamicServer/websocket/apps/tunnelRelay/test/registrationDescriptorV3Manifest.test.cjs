// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const path = require("node:path");
const { handleTunnelRegister } = require("../register.js");
const Context = require("./accountBoundTestContext.cjs");
const Fixture = require("./registrationTestFixtures.cjs");
const Surface = require(path.resolve(
	__dirname,
	"../../../../../../geelooy/apps/tunnel/agent/lib/public-action-surface.js"
));

/**
 * @file Proves relay registration separates fourteen public doors from 928 inner deeds.
 * @description
 * The Awtsmoos keeps the inward manifest complete while Awtsmoos.com advertises only
 * a small public covenant; hashes, P0 medicine, and rolling compatibility remain whole.
 */
function main() {
	const context = Context.createContext();
	try {
		const record = Context.createBinding("manifest-account", "manifest-native", "manifest-v3");
		const emergency = [
			"agentDoctor",
			"tunnelDoctor",
			"schedulerReconcile",
			"connectionMailboxReconcile",
			"nativeGenerationReplace"
		];
		const internal = [
			...emergency,
			...Array.from({ length: 923 }, (_, index) => `manifestAction${index}`)
		];
		const client = Fixture.socket("manifest-v3");
		const server = { clients: new Set(), tunnels: new Map() };
		const packet = Context.nativePacket(record, {
			protocolVersion: "awtsmoos-tunnel-v3",
			agentVersion: "split-agent-3.0.0",
			releaseSourceSha: "a".repeat(40),
			actionManifestHash: "b".repeat(64),
			actionSchemaDigest: "c".repeat(64),
			publicActionDigest: "d".repeat(64),
			publicActionCount: 14,
			supportedActions: [...Surface.PUBLIC_ACTIONS],
			actionManifest: { fs: internal, command: [], chrome: [], relay: [], streaming: [] }
		});
		assert.equal(handleTunnelRegister(server, client, packet), true);
		const descriptor = server.tunnelRegistrations.get(client.registrationKey);
		assert.ok(descriptor);
		assert.equal(descriptor.supportedActions.length, 14);
		assert.deepEqual([...descriptor.supportedActions], [...Surface.PUBLIC_ACTIONS]);
		assert.equal(descriptor.publicActionCount, 14);
		assert.equal(descriptor.actionManifest.fs.length, 928);
		assert.equal(client.supportedActions.length, 14);
		for (const action of emergency) {
			assert.equal(descriptor.actionManifest.fs.includes(action), true, action);
			assert.equal(descriptor.supportedActions.includes(action), false, action);
		}
		console.log("B_H v3 registration preserved 14 public and 928 internal actions");
	} finally {
		context.cleanup();
	}
}
main();
