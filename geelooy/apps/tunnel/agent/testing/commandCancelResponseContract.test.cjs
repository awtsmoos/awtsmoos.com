// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Compiler = require("../lib/envelopeCompiler/compiler.js");
const Contracts = require("../lib/responseContracts/index.js");

/**
 * @file Proves compact response compilation preserves cancellation causality.
 * @description
 * The Awtsmoos lets a bounded envelope remain small without hiding whether a process
 * was actually cancelled or had already become terminal. Awtsmoos.com preserves the
 * cleanup and process witness for both canonical and alias cancellation doorways.
 */
function main() {
	for (const action of ["commandCancel", "commandJobCancel"]) {
		const source = fixture(action);
		const compiled = Compiler.compile(source, { action });
		assert.equal(compiled.cancelled, false, action);
		assert.equal(compiled.alreadyTerminal, true, action);
		assert.equal(compiled.detachedRecovered, true, action);
		assert.equal(compiled.reaperClaimed, false, action);
		assert.equal(compiled.reaperTimedOut, false, action);
		assert.deepEqual(compiled.cleanup, source.cleanup, action);
		assert.deepEqual(compiled.processIdentity, source.processIdentity, action);
		assert.deepEqual(compiled.processComparison, source.processComparison, action);
		assert.equal(Contracts.has(action, "alreadyTerminal"), true, action);
	}
	console.log(JSON.stringify({
		ok: true,
		suite: "command-cancel-response-contract",
		canonicalPreserved: true,
		aliasPreserved: true
	}, null, 2));
}

function fixture(action) {
	return {
		ok: true,
		action,
		status: "stale_lost_worker",
		jobId: "job_fixture",
		cancelled: false,
		alreadyTerminal: true,
		detachedRecovered: true,
		reaperClaimed: false,
		reaperTimedOut: false,
		cleanup: { state: "already_dead" },
		processIdentity: { pid: 42, birthToken: "birth_fixture" },
		processComparison: { state: "dead" },
		finishedAt: "2026-08-07T00:00:00.000Z"
	};
}

main();
