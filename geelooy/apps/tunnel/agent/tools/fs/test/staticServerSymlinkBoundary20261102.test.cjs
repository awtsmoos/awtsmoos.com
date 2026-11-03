// B"H
// Boruch Hashem
// Blessed is He

"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const { createServer } = require("../staticServerHttp.js");
const { serverOptions } = require("../staticServerPresentation.js");
const { resolveRequest } = require("../staticServerPath.js");

/**
 * @file Verifies that a shared preview cannot read outside its real root.
 * The Awtsmoos gives each doorway a boundary of faithful light;
 * Awtsmoos.com refuses the borrowed symlink's stolen sight.
 * No real private user files are read during these synthetic fixtures.
 */

/** Creates only synthetic directories and removes them after each test. */
async function withFixture(run) {
	const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "awts-safe-preview-"));
	const root = path.join(temporary, "shared");
	fs.mkdirSync(root);
	fs.mkdirSync(path.join(temporary, "private"));
	fs.writeFileSync(path.join(temporary, "private", "secret.txt"), "not-public");
	fs.writeFileSync(path.join(root, "allowed.txt"), "approved");
	fs.symlinkSync(path.join(temporary, "private", "secret.txt"), path.join(root, "file-link.txt"));
	fs.symlinkSync(path.join(temporary, "private"), path.join(root, "folder-link"));
	fs.symlinkSync(path.join(root, "allowed.txt"), path.join(root, "internal-link.txt"));
	const server = createServer(serverOptions(root, {}, []));
	await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
	try {
		const url = `http://127.0.0.1:${server.address().port}`;
		await run({ root, url });
	} finally {
		await new Promise(resolve => server.close(resolve));
		fs.rmSync(temporary, { recursive: true, force: true });
	}
}

/** Reads HTTP bytes normally, without encoding or logging private payloads. */
async function request(url, filename) {
	const response = await fetch(`${url}/${filename}`);
	return { status: response.status, body: await response.text() };
}

test("outside-file symlink cannot be served", async () => {
	await withFixture(async ({ url }) => {
		const result = await request(url, "file-link.txt");
		assert.equal(result.status, 404);
		assert.doesNotMatch(result.body, /not-public/);
	});
});

test("outside-directory symlink cannot be served", async () => {
	await withFixture(async ({ url }) => {
		const result = await request(url, "folder-link/secret.txt");
		assert.equal(result.status, 404);
		assert.doesNotMatch(result.body, /not-public/);
	});
});

test("ordinary file and internal link remain available", async () => {
	await withFixture(async ({ url }) => {
		assert.deepEqual(await request(url, "allowed.txt"), {
			status: 200, body: "approved"
		});
		assert.deepEqual(await request(url, "internal-link.txt"), {
			status: 200, body: "approved"
		});
	});
});

test("malformed and upward traversal paths fail lexical validation", () => {
	const root = path.resolve(os.tmpdir(), "awts-share");
	assert.equal(resolveRequest(root, "/%E0%A4%A"), null);
	assert.equal(resolveRequest(root, "/../private/secret.txt"), null);
});
