// B"H — The Awtsmoos protects every released installer with a verifiable seal.
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";

/** @file Public release integrity and optional safe installed-agent verification. */
const origin = process.env.AWTSMOOS_RELEASE_ORIGIN || "https://awtsmoos.com";

/** Fetch a real public resource with a bounded timeout. */
async function get(endpoint) {
	const response = await fetch(`${origin}${endpoint}`, { signal: AbortSignal.timeout(12000) });
	assert.equal(response.status, 200, `HTTP failure ${endpoint}`);
	return response;
}

/** Verify the sealed installer and public browser assets. */
async function main() {
	const start = Date.now();
	const installer = await (await get("/api/tunnel/install/unix")).text();
	const expectedSha = installer.match(/EXPECTED_COMPONENTS_SHA256="([a-f\d]{64})"/i)?.[1];
	const expectedSize = Number(installer.match(/EXPECTED_COMPONENTS_BYTES="(\d+)"/)?.[1]);
	assert.ok(expectedSha, "Missing archive checksum");
	assert.ok(expectedSize > 1000 && expectedSize < 20_000_000);
	const archive = Buffer.from(await (await get(
		"/api/tunnel/install/installer-components.tar.gz"
	)).arrayBuffer());
	assert.equal(archive.length, expectedSize);
	assert.equal(crypto.createHash("sha256").update(archive).digest("hex"), expectedSha.toLowerCase());
	const listing = spawnSync("tar", ["-tzf", "-"], {
		input: archive, encoding: "utf8", timeout: 8000, maxBuffer: 2_000_000
	});
	assert.equal(listing.status, 0, listing.stderr);
	const files = listing.stdout.trim().split("\n");
	for (const name of ["unix-install-lock-owner.cjs", "unix-entry-quick.cjs", "unix-install-core.sh"]) {
		assert.ok(files.includes(name), `Missing release file ${name}`);
	}
	assert.ok(files.every(name => !name.startsWith("/") && !name.split("/").includes("..")));
	const descriptor = await (await get("/api/tunnel/install/bundle-manifest")).json();
	assert.equal(descriptor.ok, true);
	assert.match(descriptor.version, /^\d+\.\d+\.\d+$/);
	const html = await (await get("/apps/tunnel-control/")).text();
	assert.ok(html.includes("js/app.js"));
	const app = await (await get("/apps/tunnel-control/js/app.js")).text();
	assert.ok(app.includes('import("./boot/init.js")'));
	const builder = await (await get("/apps/tunnel-control/js/ui/core/html.js")).text();
	assert.ok(builder.includes("appendChildren"));
	await get("/apps/tunnel-control/css/bundle.css");
	console.log(`B"H — Release ${descriptor.version}, ${files.length} sealed files, HTTP assets: PASS (${Date.now()-start}ms)`);
	if (process.argv.includes("--installed-quick")) {
		const result = spawnSync("bash", ["-lc",
			`set -o pipefail; curl -fsSL --connect-timeout 4 --max-time 8 '${origin}/api/tunnel/install/unix' | bash -s -- --quick`
		], { encoding: "utf8", timeout: 14000, maxBuffer: 16000 });
		assert.equal(result.status, 0, result.stderr || result.stdout);
		assert.match(result.stdout, /verified|healthy|current/i);
		console.log("B\"H — Existing tunnel quick verification: PASS");
	}
}

main().catch(error => { console.error(`RELEASE_SMOKE_FAIL: ${error.stack || error}`); process.exitCode = 1; });
