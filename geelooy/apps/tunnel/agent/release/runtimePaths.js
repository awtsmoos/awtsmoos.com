// B"H
// Boruch Hashem
// Blessed is He

const WORKER_RUNTIME_FILES = require("./runtimeWorkerPaths.js");

/**
 * Production vessels that live outside the agent directory but are loaded by
 * installed actions. Their paths are preserved in the ZIP so runtime resolution
 * is identical in source and after installation.
 */
const EXTERNAL_DIRECTORIES = Object.freeze([
	"ai/relay/split-browser",
	"ayzarim/DosDB/awtsmoosBinary/awtsmoosDB"
]);

/**
 * Critical startup paths remain explicit even though release generation now
 * inventories the complete production tree. Installed candidates can therefore
 * perform a compact contract check without having access to the source tree.
 */
const REQUIRED_STARTUP_FILES = Object.freeze([
	"main.js",
	"lib/local-api.js",
	"lib/local-browser-relay.js",
	"lib/response-output.js",
	"lib/response-prune.js",
	"lib/response-size.js",
	"lib/response-spill.js",
	"lib/response-values.js",
	"lib/split-browser-require.js",
	"lib/runtime/connection-receipt.js",
	"lib/runtime/main-components-foundation.js",
	"lib/runtime/main-connection-activity.js",
	"lib/runtime/main-connection-open.js",
	"lib/runtime/main-connection-socket.js",
	"lib/runtime/main-connection-terminal.js",
	"lib/runtime/main-dependencies.js",
	"lib/runtime/main-lane-stats.js",
	"lib/runtime/main-queue-rejection.js",
	"lib/runtime/main-registration-effects.js",
	"lib/runtime/main-registration-timer.js",
	"lib/runtime/main-registration-watchdog.js",
	"lib/runtime/main-response-socket.js",
	"lib/runtime/main-run-progress.js",
	"lib/runtime/main-run-result.js",
	"lib/runtime/runtime-number.js",
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
	"release/runtimeWorkerPaths.js",
	...WORKER_RUNTIME_FILES,
	"recovery/archiveArtifact.js",
	"recovery/archiveFilePolicy.js",
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

const FORBIDDEN_SEGMENTS = new Set([
	"__MACOSX",
	"coverage",
	"node_modules",
	"test",
	"testing",
	"tests"
]);

/** Returns true only for paths that belong in the production runtime vessel. */
function isProductionPath(value) {
	const normalized = String(value || "").replace(/\\/g, "/").trim();
	if (!normalized) return false;
	const segments = normalized.split("/");
	const forbidden = segments.some(segment => (
		!segment ||
		segment.startsWith(".") ||
		FORBIDDEN_SEGMENTS.has(segment)
	));
	return !forbidden && !/(?:^|[._-])(?:test|spec)(?:[._-]|$)|\.smoke-|smoke-server/i.test(normalized);
}

module.exports = {
	EXTERNAL_DIRECTORIES,
	FORBIDDEN_SEGMENTS,
	REQUIRED_STARTUP_FILES,
	isProductionPath
};
