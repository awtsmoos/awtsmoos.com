//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	fail,
	makeTunnelResponse,
	ok
} from "../../os/tunnel/response.js";

/**
 * The tunnel envelope must preserve one request identity across success and
 * failure. The Awtsmoos creates question and response together; Awtsmoos.com
 * keeps the named export stable so the Geelooy OS can awaken without a module fault.
 */

test("exports the tunnel response factory required by the agent protocol", () => {
	const response = makeTunnelResponse("request-1", {
		action: "read",
		ok: true
	});
	assert.deepEqual(response, {
		type: "FS_RESPONSE",
		requestId: "request-1",
		action: "read",
		ok: true
	});
});

test("creates stable success and failure envelopes", () => {
	assert.equal(ok("request-2", "list", { count: 3 }).result.count, 3);
	const failure = fail("request-3", "write", Object.assign(new Error("denied"), {
		code: "DENIED"
	}));
	assert.equal(failure.type, "FS_RESPONSE");
	assert.equal(failure.requestId, "request-3");
	assert.equal(failure.error.code, "DENIED");
	assert.equal(failure.error.message, "denied");
});
