//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Proves safe deploy order and compact prewarming against a local server.
 * @description The protocol check lives in the canonical service verifier;
 * activation invokes it before prewarm and before its success receipt.
 */
const assert = require("node:assert/strict");
const http = require("node:http");
const path = require("node:path");
const { readFile } = require("node:fs/promises");
const { spawn } = require("node:child_process");
const test = require("node:test");

const ROOT = path.resolve(__dirname, "../..");
const PREWARM = path.join(ROOT, "scripts/production/prewarm-compact-assets.sh");
const ACTIVATE = path.join(ROOT, "scripts/production/canonical-server-activate.sh");
const VERIFY = path.join(ROOT, "scripts/production/canonical-service-verify.sh");
const EXPECTED_PATHS = [
	"/games/mitzvahWorld/experiments/Awtsmoos/src/launcher/MitzvahWorldLauncher.js?compact=true",
	"/games/mitzvahWorld/experiments/Awtsmoos/src/app/EretzStagedRuntime.js?compact=true",
	"/games/mitzvahWorld/experiments/Awtsmoos/src/launcher/styles/main-menu.css?compact=true",
	"/games/styles/player-shell/index.css?compact=true"
];

function runPrewarm(baseUrl) {
	return new Promise((resolve, reject) => {
		const child = spawn("bash", [PREWARM, baseUrl], {
			cwd: ROOT,
			stdio: ["ignore", "pipe", "pipe"]
		});
		let stdout = "";
		let stderr = "";
		child.stdout.on("data", chunk => { stdout += chunk; });
		child.stderr.on("data", chunk => { stderr += chunk; });
		child.on("error", reject);
		child.on("close", code => {
			if (code !== 0) {
				reject(new Error(`prewarm exited ${code}: ${stderr}`));
				return;
			}
			resolve(stdout);
		});
	});
}

test("prewarm visits every hot compact asset with Brotli negotiation", async () => {
	const requests = [];
	const server = http.createServer((request, response) => {
		requests.push({
			acceptEncoding: request.headers["accept-encoding"] || "",
			url: request.url
		});
		response.writeHead(200, { "Content-Type": "text/plain" });
		response.end('B"H warm');
	});
	await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
	try {
		const address = server.address();
		const output = await runPrewarm(`http://127.0.0.1:${address.port}`);
		assert.deepEqual(requests.map(item => item.url), EXPECTED_PATHS);
		for (const request of requests) {
			assert.match(request.acceptEncoding, /br/);
		}
		assert.match(output, /COMPACT_PREWARM_OK count=4/);
	} finally {
		await new Promise(resolve => server.close(resolve));
	}
});

test("canonical activation verifies the SSH protocol before prewarm and success", async () => {
	const [source, verifier] = await Promise.all([
		readFile(ACTIVATE, "utf8"),
		readFile(VERIFY, "utf8")
	]);
	const protocolIndex = source.indexOf('bash "$service_verifier"');
	const prewarmIndex = source.indexOf("compact_prewarm_failed");
	const successIndex = source.indexOf("CANONICAL_SERVER_ACTIVE");
	assert.match(verifier, /virtual_ssh_protocol_probe_failed/);
	assert.match(verifier, /verify_virtual_ssh/);
	assert.ok(protocolIndex >= 0);
	assert.ok(prewarmIndex > protocolIndex);
	assert.ok(successIndex > prewarmIndex);
});
