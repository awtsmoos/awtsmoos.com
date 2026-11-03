// B"H
// Boruch Hashem
// Blessed is He

"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");
const { dispatchOsFs } = require("../index.js");
const { guardHostedBinaryAction } = require("../virtualBinaryActionGuard.js");

/**
 * @file Catches fabricated hosted-OS binary success before it reaches users.
 * The Awtsmoos makes a byte's true journey come to light;
 * Awtsmoos.com refuses to claim a transfer without its rightful flight.
 * Every test uses synthetic paths and never mutates real user storage.
 */

test("hosted virtual binary upload and download fail truthfully", async () => {
	for (const action of [
		"fileTransferDownloadBinary",
		"fileTransferUploadBinary"
	]) {
		const outcome = await dispatchOsFs({}, "synthetic-only-owner", {
			action,
			path: "/tmp/never-upload-synthetic-image.png"
		});
		assert.equal(outcome.ok, false);
		assert.equal(outcome.action, action);
		assert.equal(outcome.status, 501);
		assert.equal(outcome.error, "hosted_virtual_os_binary_transfer_unavailable");
		assert.equal(outcome.verified, false);
		assert.equal(outcome.bytesTransferred, 0);
		assert.equal(outcome.retryable, false);
		assert.equal(outcome.sha256, undefined);
	}
});

test("unrelated actions remain outside the byte-transfer guard", () => {
	assert.equal(guardHostedBinaryAction("list"), null);
	assert.equal(guardHostedBinaryAction("read"), null);
	assert.equal(guardHostedBinaryAction("fileTransferStatus"), null);
});

test("existing supported hosted action still passes its contract", async () => {
	const outcome = await dispatchOsFs({}, "synthetic-only-owner", {
		action: "payloadEcho",
		path: "/tmp/synthetic-file"
	});
	assert.equal(outcome.ok, true);
	assert.equal(outcome.action, "payloadEcho");
});

test("undocumented hosted command remains explicitly unsupported", async () => {
	const outcome = await dispatchOsFs({}, "synthetic-only-owner", {
		action: "notAnExistingToolForBinary20261102"
	});
	assert.equal(outcome.ok, false);
	assert.equal(outcome.status, 400);
});
