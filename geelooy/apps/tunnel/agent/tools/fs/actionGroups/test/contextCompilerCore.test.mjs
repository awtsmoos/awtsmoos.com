//B"H
//Boruch Hashem
//Blessed be He

import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { loadConfig } = require("../../../../lib/config.js");
const Compiler = require("../../contextCompiler/compiler.js");
const Search = require("../../contextCompiler/search.js");
const Harness = require("./workGraphHarness.js");

/**
 * @file Proves deterministic compilation and mandatory-safe budgeting.
 * @description The Awtsmoos keeps required law even when the ordinary vessel is small;
 * Awtsmoos.com gives the same stable hash whenever the same visible truth is compiled.
 */
async function main() {
	const sandbox = Harness.createSandbox();
	const config = { ...loadConfig(), ...sandbox.config };
	const payload = {
		query: "mandatory law",
		includeGraph: false,
		charBudget: 3,
		mandatorySources: [{ id: "must:law", text: "MANDATORY-LAW" }],
		sources: [
			{ id: "optional:a", text: "optional source one" },
			{ id: "optional:b", text: "optional source two" }
		]
	};
	try {
		const first = await Compiler.compile(config, payload);
		const second = await Compiler.compile(config, payload);
		assert.equal(first.hash, second.hash);
		assert.equal(first.watermark, second.watermark);
		assert.equal(first.compilerVersion, "context-compiler-v1");
		assert.equal(first.budget.budgetExceededByMandatory, true);
		assert.deepEqual(first.sources.map(item => item.id), ["must:law"]);
		assert.equal(first.sources[0].whyIncluded.includes("mandatory"), true);
		const search = await Search.search(config, { ...payload, limit: 2 });
		assert.equal(search.watermark, first.watermark);
		assert.equal(search.results[0].id, "must:law");
		assert.equal(search.results[0].whyIncluded.includes("mandatory"), true);
		console.log(JSON.stringify({ ok: true, suite: "context-compiler-core" }));
	} finally {
		Harness.cleanupSandbox(sandbox);
	}
}

main().catch(error => {
	console.error(error?.stack || error);
	process.exitCode = 1;
});
