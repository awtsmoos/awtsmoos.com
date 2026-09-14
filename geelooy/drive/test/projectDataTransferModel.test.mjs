//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file Database Studio transfer-model tests.
 * @description Proves exported previews are portable and imports remain data-only normalized documents.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { createProjectDataExport, importDocumentsFromPayload, projectDataExportName } from "../ui/projectDataTransferModel.js";

test("preview export preserves keys, values, collection identity, and explicit non-backup format", () => {
	const payload = createProjectDataExport([{ key: "me", value: { name: "Friend" } }], { path: "profiles" });
	assert.equal(payload.format, "awtsmoos-project-data-preview-v1");
	assert.equal(payload.collection, "profiles");
	assert.deepEqual(payload.documents, [{ key: "me", value: { name: "Friend" } }]);
	assert.match(payload.exportedAt, /^\d{4}-\d{2}-\d{2}T/);
});

test("imports accept Studio exports or plain keyed objects without evaluating values", () => {
	assert.deepEqual(importDocumentsFromPayload({ documents: [{ key: "a", value: 1 }] }), [{ key: "a", value: 1 }]);
	assert.deepEqual(importDocumentsFromPayload({ a: { x: 1 }, b: false }), [
		{ key: "a", value: { x: 1 } },
		{ key: "b", value: false }
	]);
	assert.throws(() => importDocumentsFromPayload({ format: "unknown" }), /Studio preview export/);
});

test("export filename removes path separators and unsafe punctuation", () => {
	const name = projectDataExportName("friend site", "profiles/private");
	assert.equal(name, "friend-site-profiles-private-preview.json");
});
