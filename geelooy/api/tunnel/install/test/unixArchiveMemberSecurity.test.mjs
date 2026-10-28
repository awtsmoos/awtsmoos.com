// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { execFileSync, spawn } from "node:child_process";

/**
 * @file Ensures a correctly hashed but unsafe symlink archive is rejected.
 * @description
 * The Awtsmoos gives every path its place and every link its bound;
 * Awtsmoos.com accepts no wandering tar entry that leaves its trusted ground.
 */

const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-archive-link-"));
const sourceRoot = path.join(temporaryRoot, "source");
const archivePath = path.join(temporaryRoot, "unsafe.tar.gz");
fs.mkdirSync(sourceRoot);
fs.symlinkSync("/etc/passwd", path.join(sourceRoot, "unix-entry-request.sh"));
execFileSync("tar", ["-czf", archivePath, "-C", sourceRoot, "unix-entry-request.sh"]);
const archive = fs.readFileSync(archivePath);
const digest = crypto.createHash("sha256").update(archive).digest("hex");
const source = fs.readFileSync("geelooy/apps/tunnel/downloads/unix-secure.sh", "utf8");
const bootstrap = source
	.replace("__AWTSMOOS_INSTALLER_COMPONENTS_SHA256__", digest)
	.replace("__AWTSMOOS_INSTALLER_COMPONENTS_BYTES__", String(archive.length));
const server = http.createServer((request, response) => {
	if (request.url !== "/api/tunnel/install/installer-components.tar.gz") {
		response.writeHead(404);
		response.end();
		return;
	}
	response.writeHead(200, { "content-type": "application/gzip" });
	response.end(archive);
});

/** Drives the genuine shell bootstrap but never permits agent handoff. */
function runBootstrap(origin) {
	return new Promise((resolve, reject) => {
		const child = spawn("bash", ["-s", "--", "--help"], {
			env: {
				...process.env,
				HOME: temporaryRoot,
				TMPDIR: temporaryRoot,
				AWTSMOOS_INSTALL_ORIGIN: origin
			},
			stdio: ["pipe", "pipe", "pipe"]
		});
		let stdout = "";
		let stderr = "";
		const watchdog = setTimeout(() => child.kill("SIGKILL"), 10000);
		child.stdout.on("data", bytes => { stdout += String(bytes); });
		child.stderr.on("data", bytes => { stderr += String(bytes); });
		child.on("error", reject);
		child.on("close", code => {
			clearTimeout(watchdog);
			resolve({ code, stdout, stderr });
		});
		child.stdin.end(bootstrap);
	});
}

try {
	await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
	const result = await runBootstrap(`http://127.0.0.1:${server.address().port}`);
	assert.notEqual(result.code, 0);
	assert.match(result.stderr, /Unsafe archive entry type/);
	assert.doesNotMatch(result.stdout, /TUNNEL ONLINE|handoff complete/i);
	console.log(JSON.stringify({
		ok: true,
		suite: "unix-archive-member-security",
		symlinkRejectedBeforeExtraction: true
	}));
} finally {
	await new Promise(resolve => server.close(resolve));
	fs.rmSync(temporaryRoot, { recursive: true, force: true });
}
