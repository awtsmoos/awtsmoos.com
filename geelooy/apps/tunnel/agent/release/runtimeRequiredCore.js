// B"H
// Boruch Hashem
// Blessed is He

const WORKER_RUNTIME_FILES = require("./runtimeWorkerPaths.js");

/**
 * @file Names core request, response, root, worker, and release vessels.
 * @description
 * The Awtsmoos renews every action from project root through bounded result.
 * Awtsmoos.com refuses a release missing the modules that preserve workspace
 * confinement, queue pressure, worker testimony, or deterministic publication.
 */
module.exports = Object.freeze([
	"lib/local-api.js",
	"lib/local-browser-relay.js",
	"lib/response-output.js",
	"lib/response-prune.js",
	"lib/response-size.js",
	"lib/response-spill.js",
	"lib/response-values.js",
	"lib/split-browser-require.js",
	"lib/self-update-descriptor.js",
	"lib/self-update-origin.js",
	"lib/runtime/main-lane-stats.js",
	"lib/runtime/main-queue-rejection.js",
	"lib/runtime/main-run-progress.js",
	"lib/runtime/main-run-result.js",
	"lib/runtime/project-root-guidance.js",
	"lib/runtime/project-root-health.js",
	"lib/runtime/runtime-number.js",
	"lib/runtime/priority/fairQueue.js",
	"lib/runtime/priority/laneClassifier.js",
	"lib/runtime/priority/laneScheduler.js",
	"lib/runtime/priority/legacyQueue.js",
	"lib/runtime/priority/requester.js",
	"tools/fs/mission/jsonMissionStore.js",
	"release/sourcePaths.js",
	"release/runtimeCatalog.js",
	"release/runtimeFiles.js",
	"release/runtimePaths.js",
	"release/runtimeProbe.js",
	"release/runtimeRequiredCore.js",
	"release/runtimeRequiredFiles.js",
	"release/runtimeRequiredRecovery.js",
	"release/runtimeRequiredTransport.js",
	"release/runtimeWorkerPaths.js",
	...WORKER_RUNTIME_FILES,
	"ai/relay/split-browser/controlPage.cjs",
	"ai/relay/split-browser/proxy.cjs"
]);
