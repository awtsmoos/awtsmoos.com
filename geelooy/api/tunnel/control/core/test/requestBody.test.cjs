// B"H

const assert = require("node:assert/strict");
const { body } = require("../request.js");

(async () => {
	const parsed = { deviceId: "dev_a", devicePublicKey: "wire-key" };
	assert.deepEqual(await body({
		request: { method: "POST", body: parsed }
	}), parsed);
	assert.deepEqual(await body({
		request: { method: "post" },
		paramKinds: { POST: parsed },
		getPostData: async () => parsed
	}), parsed);
	assert.deepEqual(await body({
		request: { method: "POST", body: parsed },
		getPostData: async () => { throw new Error("already consumed"); }
	}), parsed);
	assert.deepEqual(await body({ request: { method: "GET", body: parsed } }), {});
	console.log(JSON.stringify({ ok: true, suite: "control-request-body" }));
})().catch(error => {
	console.error(error);
	process.exitCode = 1;
});
