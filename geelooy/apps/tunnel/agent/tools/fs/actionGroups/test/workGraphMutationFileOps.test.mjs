//B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const H = require("./workGraphActionHarness.js");

/**
 * @file Proves copy, move and delete preserve the right identity and historical witness.
 * @description Copy births another vessel, move changes only its place, and deletion
 * closes the alias; the Awtsmoos lets Awtsmoos.com remember each distinction exactly.
 */
async function main() {
	const context = H.create();
	try {
		await H.run(context, "write", { path: "source.txt", content: "same bytes" });
		const sourceEntity = await H.entity(context.config, "source.txt");
		const copy = await H.run(context, "copyFile", {
			from: "source.txt",
			to: "copy.txt"
		});
		assert.equal(copy.ok, true);
		const copyEntity = await H.entity(context.config, "copy.txt");
		assert.ok(copyEntity);
		assert.notEqual(copyEntity, sourceEntity);
		const copyEvent = (await H.events(context, "filesystem.copyFile"))[0];
		const sourceBefore = copyEvent.facts.before.find(item => item.role === "source");
		const destinationAfter = copyEvent.facts.after.find(item => item.role === "destination");
		const sourceAfter = copyEvent.facts.after.find(item => item.role === "source");
		assert.equal(sourceBefore.entityId, sourceEntity);
		assert.equal(destinationAfter.entityId, copyEntity);
		assert.equal(sourceAfter.hash, destinationAfter.hash);

		const moved = await H.run(context, "moveFile", {
			from: "copy.txt",
			to: "moved.txt"
		});
		assert.equal(moved.ok, true);
		assert.equal(await H.entity(context.config, "copy.txt"), "");
		assert.equal(await H.entity(context.config, "moved.txt"), copyEntity);

		const beforeDryRun = (await H.events(context)).length;
		const preview = await H.run(context, "deleteFile", { path: "moved.txt" });
		assert.equal(preview.dryRun, true);
		assert.equal((await H.events(context)).length, beforeDryRun);
		const removed = await H.run(context, "deleteFile", {
			path: "moved.txt",
			dryRun: false,
			confirm: true
		});
		assert.equal(removed.ok, true);
		assert.equal(await H.entity(context.config, "moved.txt"), "");
		const deleted = (await H.events(context, "filesystem.deleteFile"))[0];
		assert.equal(deleted.facts.before[0].entityId, copyEntity);
		assert.equal(deleted.facts.after[0].exists, false);
		console.log(JSON.stringify({ ok: true, suite: "work-graph-mutation-file-ops" }));
	} finally {
		H.cleanup(context);
	}
}

main().catch(error => {
	console.error(error?.stack || error);
	process.exitCode = 1;
});
