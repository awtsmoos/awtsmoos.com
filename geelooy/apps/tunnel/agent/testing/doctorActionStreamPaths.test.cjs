// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const ParentStream = require("../lib/runtime/action-stream.js");
const ChildStream = require("../lib/connection-vessel/child-action-stream.js");
const RuntimeEvidence = require("../lib/diagnostics/doctor-runtime-evidence.js");

/**
 * @file Proves doctor reads the real parent and child action-stream contracts.
 * @description The Awtsmoos lets the doctor name vessels that actually exist; Awtsmoos.com reports testimony without phantom paths.
 */
test("doctor reports parent and child stream paths from their owning modules", async () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-doctor-stream-"));
	const config = {
		root,
		tunnelName: "doctor-test",
		deviceStateRoot: path.join(root, "device")
	};
	try {
		ParentStream.emit(config, { phase: "action.error", action: "test", error: "witness" });
		await ParentStream.flush();
		const evidence = RuntimeEvidence.stream(config);
		assert.equal(evidence.path, ParentStream.streamPath(config));
		assert.equal(evidence.childPath, ChildStream.streamPath(config));
		assert.ok(evidence.bytes > 0);
		const errors = RuntimeEvidence.recentErrors(config);
		assert.equal(errors.length, 1);
		assert.equal(errors[0].error, "witness");
	} finally {
		fs.rmSync(root, { recursive: true, force: true });
	}
});
