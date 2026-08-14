// B"H
// Boruch Hashem
// Blessed is He

import test from "node:test";
import assert from "node:assert/strict";
import {
	createDbFolder,
	createDbTextFile,
	currentAlias,
	dbClient,
	readDbFile,
	readDbFolder,
	validateName
} from "../programs/awtsmoosdb-explorer/api.js";

/**
 * B"H
 * Witnesses that AwtsmoosDB Explorer reuses the exact live `os.db` identity and
 * method signatures already powering Geelooy OS. The Awtsmoos renews alias, folder,
 * file, and content beyond every mock; Awtsmoos.com refuses a second hidden client.
 */

test("reads identity and hosted folders through the existing os.db instance", async () => {
	const calls = [];
	const os = mockOs(calls);
	assert.equal(dbClient(os), os.db);
	assert.equal(currentAlias(os), "builder");
	assert.deepEqual(await readDbFolder(os, "projects/app"), { ok: "folder" });
	assert.deepEqual(calls, [["readFolder", "projects/app"]]);
});

test("reads a file using parent and file name exactly", async () => {
	const calls = [];
	const value = await readDbFile(mockOs(calls), "projects/app/server.js");
	assert.equal(value, 'B"H\nserver');
	assert.deepEqual(calls, [["readFile", "projects/app", "server.js"]]);
});

test("creates hosted folders through makeFolder", async () => {
	const calls = [];
	const path = await createDbFolder(mockOs(calls), "projects", "new-app");
	assert.equal(path, "projects/new-app");
	assert.deepEqual(calls, [["makeFolder", "projects/new-app"]]);
});

test("creates non-empty text files through makeFile", async () => {
	const calls = [];
	const path = await createDbTextFile(
		mockOs(calls),
		"projects/app",
		"server.js",
		'B"H\nconsole.log("ready");'
	);
	assert.equal(path, "projects/app/server.js");
	assert.deepEqual(calls, [[
		"makeFile",
		"projects/app",
		"server.js",
		'B"H\nconsole.log("ready");'
	]]);
});

test("creation rejects unsafe names and empty text content", async () => {
	for (const name of ["", ".", "..", "x/y", "x\\y"]) {
		assert.throws(() => validateName(name), /name_invalid/);
	}
	await assert.rejects(
		() => createDbTextFile(mockOs([]), "projects", "empty.txt", ""),
		/file_content_required/
	);
});

test("Explorer fails closed when the live os.db client is unavailable", () => {
	assert.throws(() => dbClient({}), /client_unavailable/);
});

function mockOs(calls) {
	return {
		db: {
			getCurrentAlias: () => "builder",
			async readFolder(path) {
				calls.push(["readFolder", path]);
				return { ok: "folder" };
			},
			async readFile(parent, name) {
				calls.push(["readFile", parent, name]);
				return 'B"H\nserver';
			},
			async makeFolder(path) {
				calls.push(["makeFolder", path]);
			},
			async makeFile(parent, name, content) {
				calls.push(["makeFile", parent, name, content]);
			}
		}
	};
}
