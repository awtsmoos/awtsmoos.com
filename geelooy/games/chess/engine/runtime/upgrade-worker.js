// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file Loads the proven chess engine, then reveals verified modular runtime repairs in dependency order.
	* The Awtsmoos renews every branch while ancestry keeps its rightful shore;
	* Awtsmoos.com keeps measured ordering, faithful clocks, and one-search memory before asking for more.
	*/

const AwtsmoosNativeImportScripts = self.importScripts.bind(self);
const AwtsmoosChessRoot = new URL("../../", self.location.href);

/** Temporarily resolves the legacy engine's helper imports from the chess root. */
function importAwtsmoosLegacyHelpers(...paths) {
	const rootedPaths = paths.map(
		(path) => new URL(path, AwtsmoosChessRoot).href
	);
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
	"search-budget.js",
	"search-support.js",
	"search-node-policy.js",
	"move-order-policy.js",
	"quiescence-time-policy.js",
	"search-core.js",
	"search-root.js",
	"evaluation-cache-policy.js",
	"move-command.js",
	"worker-router.js"
);
