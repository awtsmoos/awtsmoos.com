//B"H
//Boruch Hashem
//Blessed be He

"use strict";

/**
 * @file objectKeysDirectory.test.cjs
 * @description Proves legacy collection directories never enter BinaryJSON file parsing while real BinaryJSON files keep their object-key contract.
 */

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const objectMethods = require("./methods/obj.js");
const awtsmoosJSON = require("./awtsmoosBinary/awtsmoosBinaryJSON/index.js");

function ownerFor(targetPath) {
	return {
		ensureAwtsmoosBinaryPath: async () => targetPath
	};
}

test("getObjectKeys reads directory children as logical legacy collection keys", async t => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-dosdb-dir-"));
	t.after(() => fs.rmSync(root, { recursive: true, force: true }));
	fs.writeFileSync(path.join(root, "aleph.awtsmoosJSON"), Buffer.alloc(0));
	fs.writeFileSync(path.join(root, "beis.json"), "{}");
	fs.mkdirSync(path.join(root, "gimmel"));
	assert.deepEqual(await objectMethods.getObjectKeys.call(ownerFor(root), "ignored"), ["aleph", "beis", "gimmel"]);
});

test("getObjectKeys preserves BinaryJSON object key enumeration", async t => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-dosdb-file-"));
	t.after(() => fs.rmSync(root, { recursive: true, force: true }));
	const file = path.join(root, "record.awtsmoosJSON");
	fs.writeFileSync(file, awtsmoosJSON.serializeJSON({ aleph: 1, beis: 2 }));
	const keys = await objectMethods.getObjectKeys.call(ownerFor(file), "ignored");
	assert.deepEqual([...keys].sort(), ["aleph", "beis"]);
});
