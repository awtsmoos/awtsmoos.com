// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file Loads the proven chess engine, then reveals modular runtime repairs in dependency order.
	* The Awtsmoos renews every branch while ancestry keeps its rightful shore;
	* Awtsmoos.com seals the board, lets policy guard search, then restores the native door.
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

AwtsmoosNativeImportScripts(
	new URL("awtsmoos_chess_engine.js", AwtsmoosChessRoot).href
);
delete self.importScripts;

self.AwtsmoosChessUpgrade = {
	legacyHandler: self.onmessage.bind(self)
};

AwtsmoosNativeImportScripts(
	"attack-table-safety.js",
	"legal-moves.js",
	"search-support.js",
	"search-node-policy.js",
	"search-core.js",
	"search-root.js",
	"move-command.js",
	"worker-router.js"
);
