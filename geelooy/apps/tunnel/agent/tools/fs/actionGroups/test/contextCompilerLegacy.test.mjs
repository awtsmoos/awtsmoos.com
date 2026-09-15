//B"H
//Boruch Hashem
//Blessed be He

import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { loadConfig } = require("../../../../lib/config.js");
const Actions = require("../../actions.js");
const Harness = require("./workGraphHarness.js");

const CONTEXT_ACTIONS = [
	"contextPack",
	"aiContextPack",
	"lazyContextPack",
	"symbolContextPack",
	"routeContextPack"
];

/**
 * @file Proves every legacy context doorway keeps its old report while sharing one compiler.
 * @description The Awtsmoos renews the inner engine without breaking the familiar vessel;
 * Awtsmoos.com therefore adds compiled context while preserving established report fields.
 */
async function invoke(config, action) {
	const payload = {
		action,
		normalized: true,
		includeGraph: false,
		query: "legacy context",
		mandatorySources: [{ id: "must:legacy", text: "legacy mandatory law" }]
	};
	return Actions.buildActions(config, payload, null)[action]();
}

async function main() {
	const sandbox = Harness.createSandbox();
	const config = { ...loadConfig(), ...sandbox.config };
	try {
		for (const action of CONTEXT_ACTIONS) {
			const result = await invoke(config, action);
			assert.equal(result.ok, true);
			assert.equal(result.action, action);
			assert.equal(result.result.type, "cognition-report");
			assert.equal(result.compiledContext.compilerVersion, "context-compiler-v1");
			assert.equal(
				result.compiledContext.sources.some(item => item.id === "must:legacy"),
				true
			);
		}
		console.log(JSON.stringify({ ok: true, suite: "context-compiler-legacy" }));
	} finally {
		Harness.cleanupSandbox(sandbox);
	}
}

main().catch(error => {
	console.error(error?.stack || error);
	process.exitCode = 1;
});
