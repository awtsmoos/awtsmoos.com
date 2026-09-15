//B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const fsp = require("node:fs/promises");
const path = require("node:path");
const Runtime = require("../../workGraph/runtime.js");
const Ledger = require("../../workGraph/eventLedger.js");
const Entities = require("../../workGraph/entityStore.js");
const Operations = require("../../workGraph/operationStore.js");
const Context = require("../../workGraph/provenanceContext.js");
const Paths = require("../../workGraph/paths.js");
const Harness = require("./workGraphHarness.js");

/**
 * @file Exercises objective mutation provenance without going through public dispatch.
 * @description Files change garments while one identity shines through; the Awtsmoos
 * keeps deed from preview, and Awtsmoos.com preserves before, after, and causality.
 */
async function writeFile(config, file, content) {
	const result = { ok: true, witness: `write:${file}` };
	const returned = await Runtime.run(config, {
		action: "write", controlRequestId: `ctl-${file}`, path: file, content
	}, async () => {
		await fsp.writeFile(path.join(config.root, file), content);
		return result;
	});
	assert.equal(returned, result);
}

async function moveFile(config, from, to) {
	const result = { ok: true, witness: "move" };
	const returned = await Runtime.run(config, {
		action: "moveFile", controlRequestId: "ctl-move", from, to
	}, async () => {
		await fsp.rename(path.join(config.root, from), path.join(config.root, to));
		return result;
	});
	assert.equal(returned, result);
}

async function provePreview(config) {
	const payload = {
		action: "write", controlRequestId: "ctl-preview",
		path: "preview.txt", content: "preview"
	};
	const result = { ok: true, dryRun: true };
	assert.equal(await Runtime.run(config, payload, async () => result), result);
	assert.equal(await Entities.lookup(config, "preview.txt"), "");
	const context = await Context.build(config, payload);
	const operation = await Operations.get(config, context.operationId);
	assert.equal(operation.state, "finalized");
	assert.equal(operation.history.at(-1).facts.applied, false);
}

async function proveNonMutation() {
	const sandbox = Harness.createSandbox();
	try {
		const marker = { ok: true };
		assert.equal(
			await Runtime.run(sandbox.config, { action: "read" }, async () => marker),
			marker
		);
		assert.equal(fs.existsSync(Paths.projectFile(sandbox.config)), false);
	} finally {
		Harness.cleanupSandbox(sandbox);
	}
}

async function run(config) {
	await writeFile(config, "alpha.txt", "alpha");
	const entityId = await Entities.lookup(config, "alpha.txt");
	assert.ok(entityId.startsWith("awtsmoos://file/"));
	await moveFile(config, "alpha.txt", "beta.txt");
	assert.equal(await Entities.lookup(config, "alpha.txt"), "");
	assert.equal(await Entities.lookup(config, "beta.txt"), entityId);
	let events = await Ledger.list(config);
	const move = events.find(event => event.type === "filesystem.moveFile");
	assert.equal(move.facts.before[0].entityId, entityId);
	assert.equal(move.facts.after[1].entityId, entityId);
	assert.equal(move.facts.before[0].hash, move.facts.after[1].hash);
	await provePreview(config);
	assert.equal((await Ledger.list(config)).length, 2);
	await Runtime.run(config, {
		action: "deleteFile", controlRequestId: "ctl-delete", path: "beta.txt"
	}, async () => {
		await fsp.unlink(path.join(config.root, "beta.txt"));
		return { ok: true };
	});
	events = await Ledger.list(config);
	assert.deepEqual(events.map(event => event.type), [
		"filesystem.write", "filesystem.moveFile", "filesystem.deleteFile"
	]);
	assert.equal(await Entities.lookup(config, "beta.txt"), "");
	await proveNonMutation();
}

module.exports = { run };
