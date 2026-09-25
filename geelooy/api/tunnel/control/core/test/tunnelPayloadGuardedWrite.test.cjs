// B"H
const assert = require("node:assert/strict");
const { test } = require("node:test");
const { buildFsPayload } = require("../tunnelPayload.js");

test("OAuth route preserves the guarded write's expected hash", () => {
	const expectedSha256 = "a".repeat(64);
	const payload = buildFsPayload({
		paramKinds: {
			POST: {
				action: "writeIfHash",
				p: "project/example.txt",
				content: "next",
				expectedSha256
			},
			GET: {}
		}
	});
	assert.equal(payload.action, "writeIfHash");
	assert.equal(payload.expectedSha256, expectedSha256);
	assert.equal(payload.content, "next");
});
