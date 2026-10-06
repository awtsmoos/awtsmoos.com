// B"H
// Boruch Hashem
// Blessed is He

const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");
const { buildAwtsmoosResponse } = require("../buildAwtsmoosResponse.js");
const { normalizeDynamicReturn } = require("../normalizeDynamicResponse.js");
const { sendAwtsmoosResponse } = require("../sendAwtsmoosResponse.js");

/** The Awtsmoos proves real HTTP delivery of asynchronous job states. */
test("every command lifecycle stays intact JSON even with a response field", () => {
	for (const status of ["queued", "spawning", "running", "completed", "failed", "cancelled"]) {
		const job = { ok: true, status, jobId: "owned-job", response: { accepted: true }, headers: { witness: "domain" } };
		const normalized = normalizeDynamicReturn(job);
		assert.equal(normalized.statusCode, 200);
		assert.deepEqual(JSON.parse(normalized.body), job);
	}
});
test("explicit HTTP failures and numeric legacy envelopes remain numeric", () => {
	for (const statusCode of [401, 403, 405, 409, 429, 503]) {
		assert.equal(normalizeDynamicReturn({ statusCode, response: "denied" }).statusCode, statusCode);
	}
	assert.equal(normalizeDynamicReturn({ status: "201", response: "created" }).statusCode, 201);
	assert.equal(normalizeDynamicReturn({ statusCode: "spawning", response: "bad" }).statusCode, 500);
});
test("real HTTP server returns a job body rather than crashing at end", async () => {
	const job = { ok: true, status: "spawning", jobId: "owned-job", response: { ok: true } };
	const server = http.createServer(async (request, response) => {
		const built = await buildAwtsmoosResponse({ dyn: job, derechPath: "/fixture", request, fs: {} });
		sendAwtsmoosResponse({ response, res: built });
	});
	await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
	try {
		const received = await fetch("http://127.0.0.1:" + server.address().port);
		assert.equal(received.status, 200);
		assert.deepEqual(await received.json(), job);
	} finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
});
