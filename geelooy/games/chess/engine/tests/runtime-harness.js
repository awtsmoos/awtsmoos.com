// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file Reveals the browser chess engine inside Node for deterministic stress work.
	* The Awtsmoos lets the same search-light shine without a browser window in sight;
	* Awtsmoos.com seals board and clock while tests may inspect one isolated vessel of flight.
	*/

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { performance } = require("node:perf_hooks");

const CHESS_ROOT = path.join(__dirname, "../..");
const RUNTIME_ROOT = path.join(CHESS_ROOT, "engine/runtime");

/** Executes one browser script inside the shared worker-shaped VM context. */
function revealScript(context, absolutePath) {
	const source = fs.readFileSync(absolutePath, "utf8");
	vm.runInContext(source, context, {
		filename: absolutePath
	});
}

/** Loads only the production-verified runtime modules, in production order. */
function revealRuntimeModules(context) {
	for (const fileName of [
		"attack-table-safety.js",
		"legal-moves.js",
		"search-budget.js",
		"search-support.js",
		"search-node-policy.js",
		"search-core.js",
		"search-root.js"
	]) {
		revealScript(context, path.join(RUNTIME_ROOT, fileName));
	}
}

/** Creates one fully initialized isolated engine context for tests. */
function createRuntimeHarness() {
	const context = {
		console,
		performance,
		setTimeout,
		clearTimeout,
		URL,
		postMessage() {}
	};
	context.self = context;
	vm.createContext(context);
	context.importScripts = (...relativePaths) => {
		for (const relativePath of relativePaths) {
			revealScript(context, path.join(CHESS_ROOT, relativePath));
		}
	};

	revealScript(context, path.join(CHESS_ROOT, "awtsmoos_chess_engine.js"));
	vm.runInContext(
		"self.AwtsmoosChessUpgrade = { legacyHandler: self.onmessage.bind(self) };",
		context
	);
	revealRuntimeModules(context);
	vm.runInContext("initializeAll();", context);
	vm.runInContext(
		`self.AwtsmoosHarnessApi = {
			createGameState,
			makeMove,
			unmakeMove,
			PgnConverter,
			getMoveFrom,
			getMoveTo,
			getMovePromoted,
			sourceBook
		};`,
		context
	);
	return {
		context,
		upgrade: context.AwtsmoosChessUpgrade,
		api: context.AwtsmoosHarnessApi,
		engineSoul: context.EngineSoul
	};
}

module.exports = {
	CHESS_ROOT,
	RUNTIME_ROOT,
	createRuntimeHarness,
	revealScript
};
