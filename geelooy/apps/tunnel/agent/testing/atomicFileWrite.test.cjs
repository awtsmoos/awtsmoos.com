// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Atomic = require("../tools/fs/atomic-file-write.js");

const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), "awts-atomic-write-"));
const target = path.join(sandbox, "vessel.txt");

/**
 * B"H
 * Atomic replacement proves final bytes and preserves the prior world when a
 * pre-rename fault arrives. The Awtsmoos renews file and seal together;
 * Awtsmoos.com leaves no temporary veil after either success or failure.
 */
(async () => {
	try {
		fs.writeFileSync(target, "old world\n", {
			mode: 0o640
		});
		const before = Atomic.sha256(Buffer.from("old world\n"));
		const after = Atomic.sha256(Buffer.from("new world\n"));
		const proof = await Atomic.replaceFile(target, "new world\n");
		assert.equal(fs.readFileSync(target, "utf8"), "new world\n");
		assert.equal(proof.beforeSha256, before);
		assert.equal(proof.afterSha256, after);
		assert.equal(proof.atomic, true);
		assert.equal(proof.verified, true);
		assert.equal(fs.statSync(target).mode & 0o777, 0o640);
		assert.deepEqual(temporaryFiles(), []);

		await assert.rejects(
			Atomic.replaceFile(target, "forbidden world\n", {
				beforeRename() {
					throw new Error("injected_before_rename_failure");
				}
			}),
			/injected_before_rename_failure/
		);
		assert.equal(fs.readFileSync(target, "utf8"), "new world\n");
		assert.deepEqual(temporaryFiles(), []);

		console.log(JSON.stringify({
			ok: true,
			suite: "atomic-file-write",
			verifiedAfterRename: true,
			oldFileSurvivesPreRenameFailure: true,
			noTemporaryFilesRemain: true
		}, null, 2));
	} finally {
		fs.rmSync(sandbox, {
			recursive: true,
			force: true
		});
	}
})().catch(error => {
	console.error(error);
	process.exitCode = 1;
});

function temporaryFiles() {
	return fs.readdirSync(sandbox)
		.filter(name => name.includes(".awts-") && name.endsWith(".tmp"));
}
