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
 * A Termux-shaped filesystem receives the complete public bootstrap without
 * touching Android or a live installation. The Awtsmoos renews shell, origin,
 * and helper flow; Awtsmoos.com proves the repaired activation reaches core.
 */
const temporaryRoot = fs.mkdtempSync(
	path.join(os.tmpdir(), "awtsmoos-termux-bootstrap-")
);
const termuxRoot = path.join(
	temporaryRoot,
	"data/data/com.termux/files"
);
const home = path.join(termuxRoot, "home");
const prefix = path.join(termuxRoot, "usr");
const installRoot = path.join(home, ".awtsmoos-tunnel");
const sentinel = path.join(temporaryRoot, "termux-install-core-ran.txt");
fs.mkdirSync(home, { recursive: true });
fs.mkdirSync(path.join(prefix, "bin"), { recursive: true });

const fixture = await startUnixBootstrapServer();
try {
	const result = await runTermuxBootstrap({
		origin: fixture.origin,
		home,
		prefix,
		installRoot,
		sentinel
	});
	assert.equal(result.code, 0, result.stderr || result.stdout);
	assert.equal(fs.readFileSync(sentinel, "utf8").trim(), installRoot);
	assert.equal(
		fixture.requests.includes("/apps/tunnel/downloads/unix-activation.sh"),
		true
	);
	assert.match(result.stdout, /Repair components ready/);
} finally {
	await fixture.close();
	fs.rmSync(temporaryRoot, { recursive: true, force: true });
}

console.log(JSON.stringify({
	ok: true,
	suite: "unix-bootstrap-termux-isolation",
	termuxEnvironmentCompleted: true,
	repairedActivationDownloaded: true
}, null, 2));

function runTermuxBootstrap(options) {
	return new Promise((resolve, reject) => {
		const child = spawn(
			"bash",
			["-c", "curl -fsSL \"$AWTSMOOS_INSTALL_ORIGIN/api/tunnel/install/unix\" | bash"],
			{
				env: {
					...process.env,
					HOME: options.home,
					PREFIX: options.prefix,
					TERMUX_VERSION: "0.118.1-isolated",
					ANDROID_ROOT: "/system",
					AWTSMOOS_INSTALL_ORIGIN: options.origin,
					AWTSMOOS_INSTALL_ROOT: options.installRoot,
					AWTSMOOS_PROGRESS_MODE: "plain",
					AWTSMOOS_TEST_SENTINEL: options.sentinel
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
