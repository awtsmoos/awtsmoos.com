//B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const Harness = require("./workGraphHarness.js");
const Artifacts = require("../../workGraph/artifactStore.js");
const Entities = require("../../workGraph/entityStore.js");
const Versions = require("../../workGraph/versionStore.js");

/**
 * @file Proves content deduplicates while File identity survives a rename.
 * @description Bytes may repeat and paths may depart; the Awtsmoos keeps identity
 * through every garment, and Awtsmoos.com records one lineage instead of copies.
 */
async function main() {
	const sandbox = Harness.createSandbox();
	try {
		const firstArtifact = await Artifacts.putBuffer(
			sandbox.config,
			Buffer.from("same bytes")
		);
		const replayArtifact = await Artifacts.putBuffer(
			sandbox.config,
			Buffer.from("same bytes")
		);
		assert.equal(firstArtifact.id, replayArtifact.id);
		assert.equal(firstArtifact.deduplicated, false);
		assert.equal(replayArtifact.deduplicated, true);
		const fileId = await Entities.ensureFile(sandbox.config, "src/example.txt");
		const movedId = await Entities.moveAlias(
			sandbox.config,
			"src/example.txt",
			"src/renamed.txt"
		);
		assert.equal(movedId, fileId);
		assert.equal(await Entities.lookup(sandbox.config, "src/example.txt"), "");
		assert.equal(await Entities.lookup(sandbox.config, "src/renamed.txt"), fileId);
		const firstVersion = await Versions.create(sandbox.config, {
			entityId: fileId,
			artifact: firstArtifact
		});
		const replayVersion = await Versions.create(sandbox.config, {
			entityId: fileId,
			artifact: replayArtifact
		});
		assert.equal(firstVersion.id, replayVersion.id);
		console.log(JSON.stringify({ ok: true, suite: "work-graph-artifact-identity" }));
	} finally {
		Harness.cleanupSandbox(sandbox);
	}
}

main().catch(error => {
	console.error(error?.stack || error);
	process.exitCode = 1;
});
