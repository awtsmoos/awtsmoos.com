// B"H

const assert = require("node:assert/strict");
const Policy = require("../protectedFsPolicy.js");

function request(body = {}) {
	return {
		$_POST: body,
		paramKinds: { POST: body, GET: {} },
		request: { body }
	};
}

const direct = Policy.buildPayload(request({
	action: "commandWait",
	jobId: "cmdjob_muse_lane_ok",
	waitTimeoutMs: 60000
}), "tun_RC99m5Wz75O789hZ0pIsay5p");

assert.equal(direct.action, "commandWait");
assert.equal(direct.jobId, "cmdjob_muse_lane_ok");
assert.equal(direct.tunnelName, "tun_RC99m5Wz75O789hZ0pIsay5p");
assert.equal(direct.asyncPayloadError, undefined);

const nested = Policy.buildPayload(request({
	action: "commandWait",
	params: JSON.stringify({
		jobId: "cmdjob_nested_muse_lane_ok",
		waitTimeoutMs: 60000
	})
}), "tun_RC99m5Wz75O789hZ0pIsay5p");

assert.equal(nested.action, "commandWait");
assert.equal(nested.jobId, "cmdjob_nested_muse_lane_ok");
assert.equal(nested.asyncPayloadError, undefined);

console.log(JSON.stringify({
	ok: true,
	suite: "protected-fs-async-job-identity",
	directJobId: direct.jobId,
	nestedJobId: nested.jobId
}));
