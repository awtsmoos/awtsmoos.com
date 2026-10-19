// B"H
"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const crypto = require("node:crypto");
const { spawnSync } = require("node:child_process");
const Bundle = require("../tools/zipBundle.js");

const modulePath = require.resolve("../tools/zipBundle.js");
const sha = bytes => crypto.createHash("sha256").update(bytes).digest("hex");

/** Exercise the actual public helper inside an independent production process. */
function runProduction(directory) {
	return spawnSync(process.execPath, ["-e", [
		"const Bundle = require(" + JSON.stringify(modulePath) + ");",
		"try { const result = Bundle.buildAgentBundle();",
		"console.log(JSON.stringify({ok:true,prebuilt:result.prebuiltVerified,version:result.version}));",
		"} catch(error) {",
		"console.log(JSON.stringify({ok:false,code:error.code,message:error.message}));",
		"}"
	].join("\n")], {
		env: {
			...process.env,
			NODE_ENV: "production",
			AWTSMOOS_TUNNEL_BUNDLE_CACHE_DIR: directory
		},
		encoding: "utf8",
		timeout: 3000
	});
}

test("missing production artifact fails quickly instead of rebuilding the ZIP", () => {
	const directory = fs.mkdtempSync(path.join(os.tmpdir(), "awts-cache-unavailable-"));
	try {
		const startedAt = performance.now();
		const child = runProduction(directory);
		assert.equal(child.status, 0, child.stderr);
		const response = JSON.parse(child.stdout.trim());
		assert.equal(response.ok, false);
		assert.equal(response.code, "tunnel_prebuilt_bundle_missing_or_invalid");
		assert.ok(performance.now() - startedAt < 2500);
	} finally {
		fs.rmSync(directory, { recursive: true, force: true });
	}
});

test("production reads verified cached bytes without a synchronous rebuild", () => {
	const directory = fs.mkdtempSync(path.join(os.tmpdir(), "awts-cache-present-"));
	try {
		const SourcePaths = require("../../../../apps/tunnel/agent/release/sourcePaths.js");
		const manifestPath = path.join(SourcePaths.resolveRoots().agentRoot, "manifest.txt");
		const bytes = Buffer.from("PK\u0003\u0004AWTSMOOS_TEST_BUNDLE");
		const candidate = {
			buffer: bytes,
			bytes: bytes.length,
			sha256: sha(bytes),
			manifestSha256: sha(fs.readFileSync(manifestPath)),
			releaseSourceSha: "a".repeat(40),
			version: "1.0.687",
			files: 3080
		};
		Bundle.writeVerifiedCache(candidate, directory);
		const child = runProduction(directory);
		assert.equal(child.status, 0, child.stderr);
		assert.deepEqual(JSON.parse(child.stdout.trim()), {
			ok: true,
			prebuilt: true,
			version: "1.0.687"
		});
	} finally {
		fs.rmSync(directory, { recursive: true, force: true });
	}
});
