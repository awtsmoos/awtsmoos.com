//B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const {
	normalizeHostedBatchPayload
} = require("../hostedVirtualOs/hostedBatchInput.js");

/**
 * The Awtsmoos lets an agent speak the simple shape it already knows, while
 * Awtsmoos.com preserves every argument by placing it in the batch engine's
 * canonical payload vessel before any publication deed begins to flow.
 */
test("flat hosted batch fields become canonical action payload", () => {
	const result = normalizeHostedBatchPayload({
		action: "actionBatch",
		actions: [{
			action: "sitePublishFolder",
			path: "asdf/sites/orbit",
			siteId: "orbit",
			mode: "snapshot"
		}]
	});

	assert.deepEqual(result.actions[0], {
		action: "sitePublishFolder",
		payload: {
			path: "asdf/sites/orbit",
			siteId: "orbit",
			mode: "snapshot"
		}
	});
});

test("explicit payload wins and nested branches normalize recursively", () => {
	const result = normalizeHostedBatchPayload({
		action: "actionBatch",
		steps: [{
			action: "read",
			path: "flat.txt",
			payload: { path: "explicit.txt" },
			then: [{ action: "read", path: "next.txt" }],
			onError: { action: "read", path: "repair.txt" }
		}]
	});

	assert.equal(result.steps[0].payload.path, "explicit.txt");
	assert.equal(result.steps[0].then[0].payload.path, "next.txt");
	assert.equal(result.steps[0].onError.payload.path, "repair.txt");
});
