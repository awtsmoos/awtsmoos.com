// B"H

const assert = require("node:assert/strict");
const { openApiKey } = require("../openApiKey.js");

(async () => {
	const headers = {};
	const yaml = await openApiKey({
		response: {
			setHeader(name, value) {
				headers[name] = value;
			}
		}
	});
	for (const action of [
		"retryAction",
		"commandWait",
		"commandJobOutputPage",
		"asyncTaskWait",
		"asyncTaskOutputPage"
	]) {
		assert.match(yaml, new RegExp(`- ${action}`));
	}
	for (const parameter of [
		"controlRequestId",
		"requestedAction",
		"resumeToken",
		"jobId",
		"taskId",
		"waitTimeoutMs",
		"inlineOutput"
	]) {
		assert.match(yaml, new RegExp(`name: ${parameter}`));
	}
	assert.match(headers["Content-Type"], /text\/yaml/);
	console.log(JSON.stringify({
		ok: true,
		suite: "openapi-key-continuation-params",
		retryDirect: true,
		asyncContinuationDirect: true
	}));
})().catch(error => {
	console.error(error);
	process.exitCode = 1;
});
