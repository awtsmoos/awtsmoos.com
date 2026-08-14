// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file Loads the proven chess engine from its original root, then reveals repaired gameplay search.
	* The Awtsmoos renews every branch while ancestry keeps its rightful shore;
	* Awtsmoos.com lets old relative helpers find home, then restores the native door.
 */

const AwtsmoosNativeImportScripts = self.importScripts.bind(self);
const AwtsmoosChessRoot = new URL("../../", self.location.href);

/** Temporarily resolves the legacy engine's helper imports from the chess root. */
function importAwtsmoosLegacyHelpers(...paths) {
	const rootedPaths = paths.map((path) => new URL(path, AwtsmoosChessRoot).href);
	AwtsmoosNativeImportScripts(...rootedPaths);
}

Object.defineProperty(self, "importScripts", {
	configurable: true,
	writable: true,
	value: importAwtsmoosLegacyHelpers
});

AwtsmoosNativeImportScripts(new URL("awtsmoos_chess_engine.js", AwtsmoosChessRoot).href);
delete self.importScripts;

self.AwtsmoosChessUpgrade = {
	legacyHandler: self.onmessage.bind(self)
};

AwtsmoosNativeImportScripts(
	"legal-moves.js",
	"search-support.js",
	"search-core.js",
	"search-root.js",
	"move-command.js",
	"worker-router.js"
);
