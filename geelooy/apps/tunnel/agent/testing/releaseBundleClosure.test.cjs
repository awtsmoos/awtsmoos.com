// B"H
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { buildAgentBundle } = require("../../../../api/tunnel/install/tools/zipBundle.js");

/**
 * B"H — The exact published ZIP must contain the whole startup dependency tree,
 * exclude transient smoke vessels, and awaken under its own installed layout.
 */
const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-release-bundle-"));
try {
	const bundle = buildAgentBundle(path.resolve(__dirname, "../../../../.."));
	const zipPath = path.join(root, "agent.zip");
	const installRoot = path.join(root, "installed");
	fs.writeFileSync(zipPath, bundle.buffer);
	fs.mkdirSync(installRoot, { recursive: true });
	const unzip = spawnSync("unzip", ["-q", zipPath, "-d", installRoot], { encoding: "utf8" });
	assert.equal(unzip.status, 0, unzip.stderr);
	const sourceManifest = fs.readFileSync(path.resolve(__dirname, "../manifest.txt"), "utf8");
	fs.writeFileSync(path.join(installRoot, "installed-manifest.txt"), sourceManifest);
	fs.writeFileSync(path.join(installRoot, "config.json"), "{\"tunnelName\":\"awt-release-probe\"}\n");
	assert.equal(fs.existsSync(path.join(installRoot, "ai/relay/split-browser/controlPage.cjs")), true);
	assert.equal(fs.existsSync(path.join(installRoot, "ai/relay/split-browser/proxy.cjs")), true);
	const hidden = walk(installRoot).filter(file => /smoke-server|\.test\./i.test(file));
	assert.deepEqual(hidden, []);
	const probe = spawnSync(process.execPath, [path.join(installRoot, "scripts/install-probe.cjs"), installRoot], {
		encoding: "utf8",
		timeout: 30000
	});
	assert.equal(probe.status, 0, `${probe.stdout}\n${probe.stderr}`);
	const receipt = JSON.parse(probe.stdout);
	assert.equal(receipt.ok, true);
	const verifier = spawnSync(process.execPath, [
		path.join(installRoot, "scripts/verify-manifest.cjs")
	], {
		encoding: "utf8",
		timeout: 30000
	});
	assert.equal(verifier.status, 0, `${verifier.stdout}\n${verifier.stderr}`);
	const verification = JSON.parse(verifier.stdout);
	assert.equal(verification.ok, true);
	assert.equal(verification.message, "manifest_fresh");
	assert.equal(verification.version, bundle.version);
	console.log(JSON.stringify({
		ok: true,
		suite: "release-bundle-closure",
		version: bundle.version,
		files: bundle.files,
		bytes: bundle.bytes,
		sha256: bundle.sha256,
		probe: receipt.stdout,
		installedVerifier: verification.message
	}, null, 2));
} finally {
	fs.rmSync(root, { recursive: true, force: true });
}

function walk(directory) {
	return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
		const fullPath = path.join(directory, entry.name);
		return entry.isDirectory() ? walk(fullPath) : [fullPath];
	});
}
