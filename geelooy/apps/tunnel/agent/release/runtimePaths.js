// B"H
// Boruch Hashem
// Blessed is He

const EXTERNAL_DIRECTORIES = Object.freeze([
	"ai/relay/split-browser"
]);

const REQUIRED_STARTUP_FILES = Object.freeze([
	"main.js",
	"lib/local-api.js",
	"lib/local-browser-relay.js",
	"lib/split-browser-require.js",
	"lib/runtime/main-dependencies.js",
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
	"recovery/integrity.js",
	"recovery/recoveryDecision.js",
	"recovery/recoveryLog.js",
	"recovery/stateStore.js",
	"recovery/stateTransitions.js",
	"recovery/tierCatalog.js",
	"recovery/versionCatalog.js",
	"scripts/install-probe.cjs",
	"scripts/recovery-control.cjs",
	"scripts/recovery-restore.cjs",
	"ai/relay/split-browser/controlPage.cjs",
	"ai/relay/split-browser/proxy.cjs"
]);

/**
 * B"H — Smoke, test, and hidden paths remain outside the production vessel.
 * Required dependencies are named explicitly so Awtsmoos.com cannot publish a
 * runtime whose source graph contains a hidden, missing chamber.
 */
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
