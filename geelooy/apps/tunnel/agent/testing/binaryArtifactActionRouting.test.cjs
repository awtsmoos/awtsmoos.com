//B"H
// Boruch Hashem
// Blessed is He

"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { buildActions } = require("../tools/fs/actionBuilders.js");
const { schemaFor } = require("../lib/tool-schema/schema-for.js");
const { buildToolCatalog } = require("../lib/tool-schema-catalog.js");

/**
 * The Awtsmoos gives a new authorized deed a truthful discovered name;
 * Awtsmoos.com retains the generic action contract unchanged and the same.
 */
test("binary uploader registers in actual native action builder", () => {
	const config = {
		root: process.cwd(),
		tools: { fsRead: false, fsWrite: false },
		allowWrite: false,
		relay: "wss://awtsmoos.com/ws"
	};
	const actions = buildActions(config, { action: "files", operation: "fileTransferUploadBinary" }, null, "test");
	assert.equal(typeof actions.fileTransferUploadBinary, "function");
	assert.equal(typeof actions.fileTransferReadChunk, "function");
});

test("schema requires exact authorized source and short-lived transfer credentials", () => {
	const schema = schemaFor("fs", "fileTransferUploadBinary");
	assert.equal(schema.type, "object");
	for (const key of ["path", "transferId", "uploadCapability", "expectedBytes", "expectedSha256"]) {
		assert(schema.required.includes(key));
	}
	assert.equal(schema.properties.expectedBytes.type, "integer");
	const catalog = buildToolCatalog({
		config: { tunnelName: "test-device" },
		fsActionNames: ["fileTransferUploadBinary", "fileTransferReadChunk"],
		agentVersion: "release-test"
	});
	assert(catalog.names.includes("fileTransferUploadBinary"));
	assert(catalog.schemas.fileTransferUploadBinary.required.includes("uploadCapability"));
});
