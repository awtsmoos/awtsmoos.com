//B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const H = require("./workGraphActionHarness.js");

/**
 * @file Proves write, guarded write, patch, ensure and touch provenance contracts.
 * @description Bytes may change or a guard may refuse them; the Awtsmoos distinguishes
 * deed from no-op, and Awtsmoos.com records only what truly crossed into the filesystem.
 */
async function main() {
	const context = H.create();
	try {
		await H.run(context, "write", { path: "a.txt", content: "one" });
		const entity = await H.entity(context.config, "a.txt");
		await H.run(context, "write", { path: "a.txt", content: "two" });
		assert.equal(await H.entity(context.config, "a.txt"), entity);
		let writes = await H.events(context, "filesystem.write");
		assert.equal(writes.length, 2);
		assert.notEqual(writes[1].facts.before[0].versionId, writes[1].facts.after[0].versionId);

		await H.run(context, "bulkWrite", {
			writes: [
				{ path: "b.txt", content: "bee" },
				{ path: "c.txt", content: "see" }
			]
		});
		assert.equal((await H.events(context, "filesystem.bulkWrite")).length, 1);

		const countBeforeMismatch = (await H.events(context)).length;
		const mismatch = await H.run(context, "writeIfHash", {
			path: "a.txt",
			expectedSha256: "0".repeat(64),
			content: "blocked"
		});
		assert.equal(mismatch.ok, false);
		assert.equal((await H.events(context)).length, countBeforeMismatch);
		await H.run(context, "writeIfHash", {
			path: "a.txt",
			expectedSha256: H.sha256(context, "a.txt"),
			content: "three"
		});
		assert.equal((await H.events(context, "filesystem.writeIfHash")).length, 1);

		const beforePatch = (await H.events(context)).length;
		const noPatch = await H.run(context, "applyPatch", {
			path: "a.txt",
			edits: [{ find: "missing-token", replace: "x" }]
		});
		assert.equal(noPatch.changed, false);
		assert.equal((await H.events(context)).length, beforePatch);
		const patch = await H.run(context, "applyPatch", {
			path: "a.txt",
			edits: [{ find: "three", replace: "four" }]
		});
		assert.equal(patch.changed, true);
		assert.equal(H.read(context, "a.txt"), "four");

		await H.run(context, "ensureFile", { path: "ensured.txt" });
		const afterCreate = (await H.events(context)).length;
		await H.run(context, "ensureFile", { path: "ensured.txt" });
		assert.equal((await H.events(context)).length, afterCreate);
		await H.run(context, "touch", { path: "ensured.txt" });
		assert.equal((await H.events(context, "filesystem.touch")).length, 1);
		console.log(JSON.stringify({ ok: true, suite: "work-graph-mutation-write-matrix" }));
	} finally {
		H.cleanup(context);
	}
}

main().catch(error => {
	console.error(error?.stack || error);
	process.exitCode = 1;
});
