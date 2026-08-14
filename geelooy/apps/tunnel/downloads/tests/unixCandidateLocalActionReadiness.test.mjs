// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import http from "node:http";
import { spawn } from "node:child_process";
import path from "node:path";

const evidence = path.resolve("geelooy/apps/tunnel/downloads/unix-candidate-probe-readiness-evidence.sh");

/**
 * @file Proves candidate local-action readiness tolerates healthy startup latency but rejects false evidence.
 * @description
 * The Awtsmoos permits a new vessel time to awaken; Awtsmoos.com still requires a real
 * `{ok:true}` `/fs` deed before promotion and keeps every dead or malformed lane bounded.
 */
async function probe(handler, overrides = {}) {
	const server = http.createServer(handler);
	await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
	const port = server.address().port;
	try {
		return await runProbe(port, overrides);
	} finally {
		await new Promise(resolve => server.close(resolve));
	}
}

function runProbe(port, overrides = {}) {
	return new Promise((resolve, reject) => {
		const startedAt = Date.now();
		const child = spawn("bash", ["-c", 'source "$EVIDENCE"; candidate_probe_action_ready'], {
			env: {
				...process.env,
				EVIDENCE: evidence,
				AWTSMOOS_NODE_BIN: process.execPath,
				CANDIDATE_PROBE_PORT: String(port),
				...overrides
			}
		});
		let stderr = "";
		child.stderr.on("data", chunk => stderr += chunk);
		child.once("error", reject);
		child.once("close", code => resolve({
			ok: code === 0,
			code,
			stderr,
			elapsedMs: Date.now() - startedAt
		}));
	});
}

function response(body, delayMs = 0) {
	return (_request, reply) => {
		setTimeout(() => {
			reply.setHeader("content-type", "application/json");
			reply.end(body);
		}, delayMs);
	};
}

async function closedPort() {
	const server = http.createServer();
	await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
	const port = server.address().port;
	await new Promise(resolve => server.close(resolve));
	return port;
}

const slow = await probe(response('{"ok":true}', 1300));
const immediate = await probe(response('{"ok":true}'));
const malformed = await probe(response("not-json"));
const rejected = await probe(response('{"ok":false}'));
const hung = await probe(() => {}, {
	AWTSMOOS_CANDIDATE_PROBE_CONNECT_TIMEOUT_SECONDS: "0.20",
	AWTSMOOS_CANDIDATE_PROBE_REQUEST_TIMEOUT_SECONDS: "0.45"
});
const closed = await runProbe(await closedPort(), {
	AWTSMOOS_CANDIDATE_PROBE_CONNECT_TIMEOUT_SECONDS: "0.20",
	AWTSMOOS_CANDIDATE_PROBE_REQUEST_TIMEOUT_SECONDS: "0.45"
});

assert.equal(slow.ok, true, slow.stderr);
assert.equal(slow.elapsedMs >= 1200, true);
assert.equal(immediate.ok, true, immediate.stderr);
for (const result of [malformed, rejected, hung, closed]) assert.equal(result.ok, false);
assert.equal(hung.elapsedMs < 2000, true);
assert.equal(closed.elapsedMs < 2000, true);

console.log(JSON.stringify({
	ok: true,
	suite: "unix-candidate-local-action-readiness",
	slowHealthyMs: slow.elapsedMs,
	immediateHealthy: immediate.ok,
	malformedRejected: !malformed.ok,
	okFalseRejected: !rejected.ok,
	hungBoundedMs: hung.elapsedMs,
	closedBoundedMs: closed.elapsedMs
}));
