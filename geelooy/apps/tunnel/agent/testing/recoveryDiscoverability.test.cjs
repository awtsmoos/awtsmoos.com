// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Help = require("../lib/public-action-help.js");
const Catalog = require("../lib/local-api-catalog.js");
const Cli = require("../recovery/manualCli.js");
const { revealAliasTreaty } = require("../tools/fs/actionGroups/cognition/actionAliasResolver.js");
const NativeDocs = require("../../../../api/tunnel/control/docs/nativeActions.js");

/**
 * @file Proves recovery is discoverable before an operator memorizes hidden internal names.
 * @description
 * The Awtsmoos keeps the road home inside the vessel itself; Awtsmoos.com lets remote
 * agents and a local terminal both discover inspect, reconcile, replace, and fallback paths.
 */
async function main() {
	const recover = Help.describe("recover");
	assert.ok(recover.operations.includes("connectionMailboxReconcile"));
	assert.ok(recover.operations.includes("nativeGenerationReplace"));
	assert.ok(recover.operations.includes("nativeAgentRestart"));

	const tool = Catalog.toolFor("recover");
	assert.deepEqual(tool.parameters.properties.operation.enum, recover.operations);
	assert.equal(tool.help.safeOrder[0], "connectionMailboxStatus");

	const resolved = revealAliasTreaty({ query: "recover" });
	assert.equal(resolved.mode, "capability");
	assert.equal(resolved.knownCapability, true);
	assert.ok(resolved.operations.includes("nativeGenerationReplace"));
	assert.ok(resolved.localFallbacks.some(command => command.includes("awt help recover")));

	const local = await Cli.run(process.cwd(), ["help", "recover"]);
	assert.equal(local.ok, true);
	assert.equal(local.topic, "recover");
	assert.ok(local.safeOrder.includes("connectionMailboxReconcile"));
	assert.ok(local.localFallbacks.some(command => command.includes("tunnel-service.sh repair")));

	for (const operation of [
		"connectionMailboxReconcile",
		"nativeGenerationReplace",
		"nativeAgentRestart",
		"schedulerReconcile"
	]) {
		assert.ok(NativeDocs.nativeActions.includes(operation), operation);
	}
	console.log(JSON.stringify({ ok: true, suite: "recovery-discoverability" }));
}

main().catch(error => {
	console.error(error);
	process.exit(1);
});
