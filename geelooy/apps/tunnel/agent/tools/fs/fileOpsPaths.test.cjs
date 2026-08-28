//B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const fsp = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const FileOps = require("./fileOpsPaths.js");

/**
 * @file Proves path mutations never bless an empty target and still honor direct p.
 * @description
 * The Awtsmoos joins declared intent to physical effect; Awtsmoos.com must not call
 * nothing a successful mkdir, while one concrete p must become one concrete directory.
 */
async function run() {
	const root = await fsp.mkdtemp(path.join(os.tmpdir(), "awtsmoos-fileops-"));
	const config = {
		root,
		allowWrite: true,
		allowSecrets: false,
		tools: { fsWrite: true }
	};
	try {
		const before = await fsp.readdir(root);
		const empty = await FileOps.mkdirp(config, {});
		assert.equal(empty.ok, false);
		assert.equal(empty.error, "missing_path");
		assert.equal(empty.count, 0);
		assert.deepEqual(await fsp.readdir(root), before);

		const direct = await FileOps.mkdirp(config, { p: "created/direct" });
		assert.equal(direct.ok, true);
		assert.equal(direct.count, 1);
		assert.equal(fs.statSync(path.join(root, "created/direct")).isDirectory(), true);

		assert.deepEqual(FileOps.normalizePaths({ params: '{"p":"from-params"}' }), [
			"from-params"
		]);
		console.log("BHY mkdirp reports missing targets as failure and preserves direct p");
	} finally {
		await fsp.rm(root, { recursive: true, force: true });
	}
}

run().catch(error => {
	console.error(error);
	process.exitCode = 1;
});
