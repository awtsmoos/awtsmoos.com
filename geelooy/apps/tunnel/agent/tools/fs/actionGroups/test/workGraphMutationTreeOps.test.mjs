//B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const H = require("./workGraphActionHarness.js");

/**
 * @file Proves tree mutations emit path truth while destructive previews remain silent.
 * @description A directory is a vessel of vessels; the Awtsmoos records its boundary
 * deeds without pretending every descendant is one file, and Awtsmoos.com keeps previews unreal.
 */
async function main() {
	const context = H.create();
	try {
		await H.run(context, "mkdirp", { path: "tree/source" });
		const afterCreate = (await H.events(context)).length;
		await H.run(context, "mkdirp", { path: "tree/source" });
		assert.equal((await H.events(context)).length, afterCreate);
		await fs.writeFile(
			path.join(context.projectRoot, "tree/source/a.txt"),
			"tree bytes"
		);

		const copy = await H.run(context, "copyTree", {
			from: "tree/source",
			to: "tree/copied",
			dryRun: false
		});
		assert.equal(copy.ok, true);
		assert.equal((await H.events(context, "filesystem.copyTree")).length, 1);
		assert.equal(
			await fs.readFile(path.join(context.projectRoot, "tree/copied/a.txt"), "utf8"),
			"tree bytes"
		);

		const move = await H.run(context, "moveTree", {
			from: "tree/copied",
			to: "tree/moved",
			dryRun: false,
			confirm: true
		});
		assert.equal(move.ok, true);
		assert.equal((await H.events(context, "filesystem.moveTree")).length, 1);

		const beforeEmptyPreview = (await H.events(context)).length;
		const preview = await H.run(context, "emptyDir", { path: "tree/moved" });
		assert.equal(preview.dryRun, true);
		assert.equal((await H.events(context)).length, beforeEmptyPreview);
		await H.run(context, "emptyDir", {
			path: "tree/moved",
			dryRun: false,
			confirm: true
		});
		assert.equal((await H.events(context, "filesystem.emptyDir")).length, 1);

		const beforeDeletePreview = (await H.events(context)).length;
		await H.run(context, "deleteTree", { path: "tree/moved" });
		assert.equal((await H.events(context)).length, beforeDeletePreview);
		await H.run(context, "deleteTree", {
			path: "tree/moved",
			dryRun: false,
			confirm: true
		});
		assert.equal((await H.events(context, "filesystem.deleteTree")).length, 1);
		console.log(JSON.stringify({ ok: true, suite: "work-graph-mutation-tree-ops" }));
	} finally {
		H.cleanup(context);
	}
}

main().catch(error => {
	console.error(error?.stack || error);
	process.exitCode = 1;
});
