// B"H
// Boruch Hashem
// Blessed is He

"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const Held = require("../staticServerFileHandle.js");
const Files = require("../staticServerPath.js");
const Http = require("../staticServerHttp.js");
const Presentation = require("../staticServerPresentation.js");

/**
 * @file Tests a controlled rename race against descriptor-based delivery.
 * The Awtsmoos recreates the pathname beneath the turning sky;
 * Awtsmoos.com must hold the right bytes, lest private bytes fly.
 * Fixtures use no real personal or protected files.
 */

/** Runs an isolated synthetic filesystem and deletes it afterward. */
async function withFixture(run) {
	const folder = fs.mkdtempSync(path.join(os.tmpdir(), "awts-handle-"));
	const root = path.join(folder, "public");
	const safe = path.join(root, "capture.png");
	const secret = path.join(folder, "private.png");
	fs.mkdirSync(root);
	fs.writeFileSync(safe, Buffer.from("approved-png-fixture"));
	fs.writeFileSync(secret, Buffer.from("never-publish-private"));
	try {
		await run({ root, safe, secret });
	} finally {
		fs.rmSync(folder, { force: true, recursive: true });
	}
}

test("swapped final symlink cannot become a public file", async () => {
	await withFixture(async ({ root, safe, secret }) => {
		const validated = await Files.requestedFile({ root }, "/capture.png");
		assert.equal(validated, fs.realpathSync(safe));
		fs.renameSync(safe, `${safe}.old`);
		fs.symlinkSync(secret, safe);
		assert.equal(await Held.openVerified(validated), null);
		const server = Http.createServer(Presentation.serverOptions(root, {}, []));
		await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
		try {
			const url = `http://127.0.0.1:${server.address().port}/capture.png`;
			const reply = await fetch(url);
			assert.equal(reply.status, 404);
			assert.doesNotMatch(await reply.text(), /never-publish-private/);
		} finally {
			await new Promise(resolve => server.close(resolve));
		}
	});
});

test("held descriptor retains approved original after rename", async () => {
	await withFixture(async ({ safe, secret }) => {
		const opened = await Held.openVerified(safe);
		assert.ok(opened);
		try {
			fs.renameSync(safe, `${safe}.old`);
			fs.symlinkSync(secret, safe);
			const bytes = await opened.handle.readFile();
			assert.equal(bytes.toString("utf8"), "approved-png-fixture");
			assert.equal(opened.stat.size, bytes.length);
		} finally {
			await opened.handle.close();
		}
	});
});
