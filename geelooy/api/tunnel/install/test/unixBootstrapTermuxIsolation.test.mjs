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
 * @file Proves verified stage zero preserves the Termux-shaped runtime boundary.
 * @description
 * The Awtsmoos lights the Android home while retaining each path and key;
 * Awtsmoos.com admits one verified archive, never helpers arriving freely.
 */

const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-termux-bootstrap-"));
const termuxRoot = path.join(temporaryRoot, "data/data/com.termux/files");
const home = path.join(termuxRoot, "home");
const prefix = path.join(termuxRoot, "usr");
const installRoot = path.join(home, ".awtsmoos-tunnel");
const sentinel = path.join(temporaryRoot, "termux-install-core-ran.txt");
fs.mkdirSync(home, { recursive: true });
fs.mkdirSync(path.join(prefix, "bin"), { recursive: true });
const fixture = await startUnixBootstrapServer();

/** Runs the unchanged curl-pipe-bash command in synthetic Termux custody. */
function runBootstrap() {
	return new Promise((resolve, reject) => {
		const child = spawn("bash", [
			"-c",
			"curl -fsSL \"$AWTSMOOS_INSTALL_ORIGIN/api/tunnel/install/unix\" | bash"
		], {
			cwd: home,
			env: {
				...Object.fromEntries(Object.entries(process.env)
					.filter(([key]) => !key.startsWith("AWTSMOOS_"))),
				PWD: home,
				HOME: home,
				PREFIX: prefix,
				TERMUX_VERSION: "0.118.1-isolated",
				ANDROID_ROOT: "/system",
				AWTSMOOS_INSTALL_ORIGIN: fixture.origin,
				AWTSMOOS_INSTALL_ROOT: installRoot,
				AWTSMOOS_PROJECT_ROOT: "",
				AWTSMOOS_TEST_SENTINEL: sentinel
			}
		});
		let stdout = "";
		let stderr = "";
		child.stdout.on("data", chunk => { stdout += String(chunk); });
		child.stderr.on("data", chunk => { stderr += String(chunk); });
		child.once("error", reject);
		child.once("close", code => resolve({ code, stdout, stderr }));
	});
}

try {
	const result = await runBootstrap();
	assert.equal(result.code, 0, result.stderr || result.stdout);
	const physicalHome = fs.realpathSync(home);
	const values = fs.readFileSync(sentinel, "utf8").trim().split("\t");
	assert.deepEqual(values, [physicalHome, physicalHome, physicalHome, installRoot]);
	assert.ok(fixture.requests.includes("/api/tunnel/install/installer-components.tar.gz"));
	assert.ok(!fixture.requests.some(request => request.includes("unix-activation.sh")));
	assert.match(result.stdout, /Verified archive custody handoff/);
	console.log(JSON.stringify({
		ok: true,
		suite: "unix-bootstrap-termux-isolation",
		verifiedArchiveUsed: true,
		callerDirectoryPreserved: true
	}));
} finally {
	await fixture.close();
	fs.rmSync(temporaryRoot, { recursive: true, force: true });
}
