// B"H
// Boruch Hashem
// Blessed is He

const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const Finish = require("../tools/fs/actionFinish.js");
const Focus = require("../tools/fs/mission/response/compact.js");
const Lock = require("../tools/fs/mission/lock/index.js");

/**
 * @file Proves advisory mission light never consumes actionBatch evidence.
 * @description
 * The Awtsmoos lets counsel shine beside the deed in rhyme; Awtsmoos.com keeps
 * every bounded batch witness visible while hard gates still guard their time.
 */
function createOhrBatchResult() {
	const firstResult = {
		name: "manifest",
		action: "stat",
		ok: true,
		attempt: 1,
		result: { ok: true, path: "manifest.txt" }
	};
	const secondResult = {
		name: "runtime",
		action: "stat",
		ok: true,
		attempt: 1,
		result: { ok: true, path: "runtime.js" }
	};
	return {
		ok: true,
		action: "actionBatch",
		count: 2,
		results: [firstResult, secondResult],
		named: { manifest: firstResult, runtime: secondResult },
		vars: { witness: "preserved" },
		last: secondResult,
		error: null
	};
}

function proveAdvisoryPreservesEvidence() {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-batch-advisory-"));
	const config = { root };
	const suggestedNext = { action: "missionDaemonTick", missionId: "m-batch" };
	Lock.set(config, {
		missionId: "m-batch",
		releaseAllowed: false,
		lastMustCallNext: suggestedNext
	});
	const finished = Finish.finishAction(
		config,
		{ action: "actionBatch" },
		createOhrBatchResult()
	);
	assert.equal(finished.count, 2);
	assert.equal(finished.results.length, 2);
	assert.equal(finished.vars.witness, "preserved");
	assert.equal(finished.last.name, "runtime");
	assert.equal(finished.named.manifest.name, "manifest");
	assert.equal(finished.missionAdvisory.active, true);
	assert.deepStrictEqual(finished.nextSuggestedToolCall, suggestedNext);
	assert.equal(finished.finalAnswerAllowed, true);
	assert.equal(finished.mustContinue, false);
}

function proveHardGateStillCompacts() {
	const compacted = Focus.compact({
		...createOhrBatchResult(),
		mustContinue: true,
		finalAnswerAllowed: false,
		mustCallNext: { action: "missionNext", missionId: "m-hard" }
	}, { action: "actionBatch" });
	assert.equal(compacted.finalAnswerAllowed, false);
	assert.equal(compacted.mustContinue, true);
	assert.equal(compacted.results, undefined);
	assert.equal(compacted.responseShape, "focused-mission-v7-concise");
}

proveAdvisoryPreservesEvidence();
proveHardGateStillCompacts();
console.log(JSON.stringify({
	ok: true,
	suite: "mission-advisory-preserves-action-batch-evidence"
}, null, 2));
