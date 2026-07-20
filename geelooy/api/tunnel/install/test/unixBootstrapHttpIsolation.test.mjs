// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { startUnixBootstrapServer } from "./unix-bootstrap-server.mjs";

/**
 * B"H
 *
 * This test performs the user's curl-pipe-bash journey inside a temporary
 * world. The Awtsmoos renews HTTP, shell, and helper download together;
 * Awtsmoos.com proves the repaired activation helper reaches install-core.
 */
const temporaryRoot = fs.mkdtempSync(
	path.join(os.tmpdir(), "awtsmoos-unix-bootstrap-")
);
const home = path.join(temporaryRoot, "home");
const installRoot = path.join(home, ".awtsmoos-tunnel");
const sentinel = path.join(temporaryRoot, "install-core-ran.txt");
fs.mkdirSync(home, { recursive: true });

const fixture = await startUnixBootstrapServer();
try {
	const result = await runBootstrap({
		origin: fixture.origin,
		home,
		installRoot,
		sentinel
	});
	assert.equal(result.code, 0, result.stderr || result.stdout);
	assert.equal(fs.readFileSync(sentinel, "utf8").trim(), installRoot);
	assert.equal(
		fixture.requests.includes("/api/tunnel/install/unix"),
		true
	);
	assert.equal(
		fixture.requests.includes(
			"/apps/tunnel/downloads/unix-activation.sh"
		),
		true
	);
	assert.equal(fixture.requests.length > 40, true);
	assert.match(result.stdout, /Repair components ready/);
} finally {
	await fixture.close();
	fs.rmSync(temporaryRoot, { recursive: true, force: true });
}

console.log(JSON.stringify({
	ok: true,
	suite: "unix-bootstrap-http-isolation",
	curlPipeBashCompleted: true,
	repairedActivationDownloaded: true
}, null, 2));

function runBootstrap({ origin, home, installRoot, sentinel }) {
	return new Promise((resolve, reject) => {
		const child = spawn(
			"bash",
			["-c", "curl -fsSL \"$AWTSMOOS_INSTALL_ORIGIN/api/tunnel/install/unix\" | bash"],
			{
				env: {
					...process.env,
					HOME: home,
					AWTSMOOS_INSTALL_ORIGIN: origin,
					AWTSMOOS_INSTALL_ROOT: installRoot,
					AWTSMOOS_PROGRESS_MODE: "plain",
					AWTSMOOS_TEST_SENTINEL: sentinel
				}
			}
		);
		let stdout = "";
		let stderr = "";
		child.stdout.on("data", chunk => {
			stdout += chunk;
		});
		child.stderr.on("data", chunk => {
			stderr += chunk;
		});
		child.once("error", reject);
		child.once("close", code => resolve({ code, stdout, stderr }));
	});
}
