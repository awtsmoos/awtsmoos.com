// B"H
// Boruch Hashem
// Blessed is He

const EXTERNAL_DIRECTORIES = Object.freeze([
	"ai/relay/split-browser"
]);

/**
 * B"H
 *
 * Required startup paths are explicit roots of the release graph. The Awtsmoos
 * renews every imported chamber; Awtsmoos.com refuses a manifest that remembers
 * yesterday while omitting transport, scheduler, or recovery dependencies.
 */
const REQUIRED_STARTUP_FILES = Object.freeze([
	"main.js",
	"lib/local-api.js",
	"lib/local-browser-relay.js",
	"lib/split-browser-require.js",
	"lib/runtime/connection-receipt.js",
	"lib/runtime/main-components-foundation.js",
	"lib/runtime/main-connection-activity.js",
	"lib/runtime/main-connection-socket.js",
	"lib/runtime/main-dependencies.js",
	"lib/runtime/main-lane-stats.js",
	"lib/runtime/main-queue-rejection.js",
	"lib/runtime/main-run-progress.js",
	"lib/runtime/main-run-result.js",
	"lib/runtime/priority/fairQueue.js",
	"lib/runtime/priority/laneClassifier.js",
	"lib/runtime/priority/laneScheduler.js",
	"lib/runtime/priority/legacyQueue.js",
	"lib/runtime/priority/requester.js",
	"lib/self-update-origin.js",
	"tools/fs/mission/jsonMissionStore.js",
	"release/sourcePaths.js",
	"release/runtimeCatalog.js",
	"release/runtimeFiles.js",
	"release/runtimePaths.js",
	"release/runtimeProbe.js",
	"recovery/archiveRestore.js",
	"recovery/archiveSafety.js",
	"recovery/archiveStore.js",
	"recovery/candidateSelector.js",
	"recovery/controller.js",
	"recovery/crashPolicy.js",
	"recovery/healthyTransition.js",
	"recovery/integrity.js",
	"recovery/recoveryDecision.js",
	"recovery/recoveryLog.js",
	"recovery/registrationFailureTransition.js",
	"recovery/stateStore.js",
	"recovery/stateTransitions.js",
	"recovery/tierCatalog.js",
	"recovery/versionCatalog.js",
	"scripts/connection-status.cjs",
	"scripts/install-probe.cjs",
	"scripts/recovery-control.cjs",
	"scripts/recovery-restore.cjs",
	"ai/relay/split-browser/controlPage.cjs",
	"ai/relay/split-browser/proxy.cjs"
]);

/** Returns true only for files that belong in the production runtime vessel. */
function isProductionPath(value) {
	const normalized = String(value || "").replace(/\\/g, "/");
	const forbidden = normalized.split("/").some(segment => (
		segment.startsWith(".") ||
		segment === "testing" ||
		segment === "test" ||
		segment === "__MACOSX" ||
		segment === ".DS_Store"
	));
	return !forbidden && !/\.test\.|\.smoke-|smoke-server/i.test(normalized);
}

module.exports = {
	EXTERNAL_DIRECTORIES,
	REQUIRED_STARTUP_FILES,
	isProductionPath
};
