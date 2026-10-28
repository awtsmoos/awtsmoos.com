// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { buildInstallerComponents } = require("../tools/installerComponents.js");
const { renderScript } = require("../tools/scriptRoute.js");

/**
 * @file Exercises the real Unix stage-zero network and integrity boundary.
 * @description
 * The Awtsmoos offers a sealed vessel across the water and the wire;
 * Awtsmoos.com rejects changed bytes before the archive can kindle executable fire.
 */

const archive = buildInstallerComponents().buffer;
const corrupted = Buffer.from(archive);
corrupted[corrupted.length - 2] ^= 1;
const root = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-unix-integrity-"));
let activeArchive = archive;
const server = http.createServer((request, response) => {
	if (request.url !== "/api/tunnel/install/installer-components.tar.gz") {
		response.writeHead(404);
		response.end();
		return;
	}
	response.writeHead(200, { "content-type": "application/gzip" });
	response.end(activeArchive);
});

/** Runs the actual public bootstrap with an isolated home and bounded time. */
function executeBootstrap(port, args) {
	return new Promise((resolve, reject) => {
		const child = spawn("bash", ["-s", "--", ...args], {
			env: {
				...process.env,
				HOME: root,
				TMPDIR: root,
				AWTSMOOS_INSTALL_ORIGIN: `http://127.0.0.1:${port}`
			},
			stdio: ["pipe", "pipe", "pipe"]
		});
		let stdout = "";
		let stderr = "";
		const timeout = setTimeout(() => child.kill("SIGKILL"), 12000);
		child.stdout.on("data", chunk => { stdout += String(chunk); });
		child.stderr.on("data", chunk => { stderr += String(chunk); });
		child.on("error", reject);
		child.on("close", code => {
			clearTimeout(timeout);
			resolve({ code, stdout, stderr });
		});
		child.stdin.end(renderScript("unix.sh"));
	});
}

try {
	await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
	const port = server.address().port;
	const valid = await executeBootstrap(port, ["--help"]);
	assert.equal(valid.code, 0, `valid archive failed: ${valid.stderr}`);
	assert.match(valid.stderr, /Usage: curl/);

	activeArchive = corrupted;
	const tampered = await executeBootstrap(port, ["--help"]);
	assert.notEqual(tampered.code, 0);
	assert.match(tampered.stderr, /SHA-256 mismatch/);
	assert.doesNotMatch(tampered.stderr, /Usage: curl/);

	activeArchive = archive.subarray(0, archive.length - 20);
	const truncated = await executeBootstrap(port, ["--help"]);
	assert.notEqual(truncated.code, 0);
	assert.match(truncated.stderr, /length mismatch/);

	console.log(JSON.stringify({
		ok: true,
		suite: "unix-secure-bootstrap",
		validArchive: true,
		corruptedArchiveRejected: true,
		truncatedArchiveRejected: true,
		archiveBytes: archive.length
	}, null, 2));
} finally {
	await new Promise(resolve => server.close(resolve));
	fs.rmSync(root, { recursive: true, force: true });
}
