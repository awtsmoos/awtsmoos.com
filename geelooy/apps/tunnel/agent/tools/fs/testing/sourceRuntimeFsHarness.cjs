// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fsp = require("node:fs/promises");
const path = require("node:path");
const Context = require("./sourceRuntimeTestContext.cjs");

/**
 * @file Proves source-level bulk filesystem and command-tree execution contracts.
 * @description
 * The Awtsmoos keeps data movement and workflow orchestration in one hermetic root;
 * Awtsmoos.com tests source behavior without borrowing the user's live workspace state.
 */
async function testBulkRead() {
	const { readBulk, uniqueSpecs } = Context.requireFromRepo(
		"apps/tunnel/agent/tools/fs/bulkRead.js"
	);
	await fsp.rm(Context.fsRoot, { recursive: true, force: true });
	await fsp.mkdir(Context.fsRoot, { recursive: true });
	await fsp.writeFile(path.join(Context.fsRoot, "a.txt"), "Alef", "utf8");
	await fsp.writeFile(path.join(Context.fsRoot, "b.txt"), "Beis", "utf8");
	assert.deepEqual(
		uniqueSpecs("a.txt\nb.txt".split(/\n/)).map(item => item.path),
		["a.txt", "b.txt"]
	);
	const newline = await readBulk(Context.configuration(), {
		paths: "a.txt\nb.txt",
		maxFiles: 5,
		maxChars: 20
	});
	assert.equal(newline.ok, true);
	assert.equal(newline.requestedCount, 2);
	assert.equal(newline.returnedCount, 2);
	assert.equal(newline.files["a.txt"].content, "Alef");
	assert.equal(newline.files["b.txt"].content, "Beis");
	const limited = await readBulk(Context.configuration(), {
		paths: '["a.txt","b.txt"]',
		maxFiles: 1,
		maxChars: 20
	});
	assert.equal(limited.requestedCount, 2);
	assert.equal(limited.returnedCount, 1);
	assert.equal(limited.skippedCount, 1);
	assert.equal(limited.partial, true);
	return { ok: true, requested: newline.requestedCount, limited: limited.returnedCount };
}

async function testCommandTree() {
	const { buildWorkflowActions } = Context.requireFromRepo(
		"apps/tunnel/agent/tools/fs/actionGroups/workflowActions.js"
	);
	const payload = {
		action: "commandTreeRun",
		steps: [
			{ id: "first", action: "echo", payload: { value: "one" }, saveAs: "first" },
			{ assert: { path: "named.first.value", eq: "one" } },
			{
				forEach: {
					in: ["a", "b"],
					as: "letter",
					do: [{ action: "echo", payload: { value: "$vars.letter" } }]
				}
			}
		]
	};
	const actions = buildWorkflowActions(
		{ config: Context.configuration(), payload, ws: null },
		fakeBuildActions
	);
	const result = await actions.commandTreeRun();
	assert.equal(result.ok, true);
	assert.equal(result.count, 5);
	assert.equal(result.results[0].result.value, "one");
	assert.equal(result.results[2].result.value, "a");
	assert.equal(result.results[3].result.value, "b");
	assert.equal(result.results[4].result.forEach, 2);
	const dryPayload = { action: "commandTreeDryRun", steps: payload.steps };
	const dry = await buildWorkflowActions(
		{ config: Context.configuration(), payload: dryPayload, ws: null },
		fakeBuildActions
	).commandTreeDryRun();
	assert.equal(dry.ok, true);
	assert.ok(Array.isArray(dry.plan));
	return { ok: true, runCount: result.count, dryPlanCount: dry.plan.length };
}

function fakeBuildActions(_config, payload) {
	return {
		echo: async () => ({ ok: true, action: "echo", value: payload.value }),
		fail: async () => ({ ok: false, action: "fail", error: "forced" })
	};
}

module.exports = { testBulkRead, testCommandTree };
