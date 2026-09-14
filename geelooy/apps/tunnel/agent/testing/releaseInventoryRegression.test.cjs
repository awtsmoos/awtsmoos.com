//B"H
//Boruch Hashem
//Blessed be He

const assert = require("node:assert/strict");
const Catalog = require("../release/runtimeCatalog.js");
const Manifest = require("../rebuild-manifest.cjs");
const SourcePaths = require("../release/sourcePaths.js");

/**
 * @file Proves the committed public manifest exactly matches the production collaboration/runtime closure.
 * @description
 * The Awtsmoos gathers every saved-route, room, instruction, browser, mission, broker, queue, and database spark;
 * Awtsmoos.com rejects a release if any required vessel is absent, duplicated, or outside the authoritative inventory.
 */
const roots = SourcePaths.resolveRoots();
const committed = Manifest.readCurrent(Manifest.OUT);
const built = Manifest.buildManifest({ version: committed.version });
const critical = [
	"lib/instructions/hybridService.js",
	"lib/instructions/projectInstructionDiscovery.js",
	"lib/instructions/projectInstructionPaths.js",
	"lib/instructions/serverBroker.js",
	"lib/instructions/serverBrokerSupport.js",
	"tools/fs/actionGroups/websiteAgents/prompt/projectInstructions.js",
	"tools/fs/actionGroups/websiteAgents/runner/acceptedTurnRecovery.js",
	"tools/fs/actionGroups/websiteAgents/runner/conversationRouteEvidence.js",
	"tools/fs/actionGroups/websiteAgents/runner/delegateChildRoom.js",
	"tools/fs/actionGroups/websiteAgents/runner/message.js",
	"tools/fs/actionGroups/websiteAgents/runner/prepareRunTurn.js",
	"tools/fs/actionGroups/websiteAgents/runner/processSpawnOutcome.js",
	"tools/fs/actionGroups/websiteAgents/runner/roomTurnContext.js",
	"tools/fs/actionGroups/websiteAgents/runner/seedRoom.js",
	"tools/fs/actionGroups/websiteAgents/runner/turnPrompt.js",
	"ai/relay/direct/chatgpt/ConversationRouteWaiter.mjs",
	"ai/relay/direct/chatgpt/DirectTurnRouteGate.mjs",
	"ai/relay/direct/chatgpt/DirectServiceTurnLifecycle.mjs",
	"ai/relay/direct/chatgpt/DirectServiceTurnPresentation.mjs",
	"ai/relay/direct/chatgpt/DirectServiceTurnRecovery.mjs",
	"ai/relay/direct/stress/GlobalWebsiteAcceptedReceiptStore.mjs",
	"ai/relay/direct/stress/GlobalWebsiteQueueAcceptance.mjs",
	"ai/relay/direct/stress/GlobalWebsiteQueueAdmission.mjs",
	"ai/relay/direct/stress/GlobalWebsiteQueueLease.mjs",
	"ai/relay/direct/stress/GlobalWebsiteQueueLimits.mjs",
	"ai/relay/direct/stress/GlobalWebsiteQueueLock.mjs",
	"ai/relay/direct/stress/GlobalWebsiteQueueReceiptHydration.mjs",
	"ai/relay/direct/stress/GlobalWebsiteQueueReconciliation.mjs",
	"ai/relay/direct/stress/GlobalWebsiteQueueSnapshot.mjs",
	"ai/relay/direct/stress/GlobalWebsiteQueueState.mjs",
	"ai/relay/direct/stress/GlobalWebsiteQueueStateCleanup.mjs",
	"tools/fs/actionGroups/websiteAgents/prompt/identity.js",
	"lib/runtime/request-retry-disk.js",
	"tools/fs/atomic-file-write.js",
	"tools/chrome/actionQueue.js",
	"tools/relay/isolatedFetch.js",
	"ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js"
];

Catalog.assertManifestCoverage(committed.files, roots);
assert.deepEqual(committed.files, built.files,
	"committed manifest must equal the authoritative source inventory");
for (const file of critical) {
	assert.ok(committed.files.includes(file), `committed manifest omitted ${file}`);
}
assert.equal(committed.files.length, new Set(committed.files).size,
	"committed manifest paths remain unique");
assert.throws(
	() => Catalog.assertManifestCoverage(
		committed.files.filter(file => file !== critical[0]), roots),
	/manifest_dependency_omission:/
);
assert.throws(
	() => Catalog.assertManifestCoverage([...committed.files, committed.files[0]], roots),
	/manifest_duplicate_path:/
);

console.log(JSON.stringify({
	ok: true,
	suite: "release-inventory-regression",
	version: committed.version,
	files: committed.files.length,
	critical
}, null, 2));
