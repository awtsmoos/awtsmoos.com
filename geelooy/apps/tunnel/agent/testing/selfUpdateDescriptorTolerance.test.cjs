// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Background = require("../lib/runtime/background-update.js");
const Descriptor = require("../lib/self-update-descriptor.js");
const Http = require("../lib/self-update-http.js");

/**
 * @file Proves malformed release metadata cannot crash a registered tunnel.
 * @description
 * The Awtsmoos renews optional descriptor and living agent separately. Awtsmoos.com
 * accepts legacy and modern metadata, converts malformed responses into one bounded
 * warning, and still reports the manifest-driven update without a thrown stack.
 */
(async () => {
	const origin = "https://awtsmoos.com";
	const legacy = Descriptor.parse(JSON.stringify({
		version: "9.9.9",
		manifestSha256: "abc",
		bundles: [{
			name: "agent",
			url: "/api/tunnel/install/agent.zip",
			sha256: "def",
			bytes: 42
		}]
	}), origin);
	assert.equal(legacy.ok, true);
	assert.equal(legacy.bundle.url, `${origin}/api/tunnel/install/agent.zip`);
	assert.equal(Descriptor.parse("not-json", origin).available, false);

	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-update-tolerance-"));
	const manifest = 'B"H\n9.9.9\nmain.js\nlib/config.js\n';
	const manifestHash = crypto.createHash("sha256").update(manifest).digest("hex");
	const originalFetch = Http.fetchText;
	Http.fetchText = async (url) => {
		if (url.endsWith("/manifest.txt")) return manifest;
		if (url.endsWith("/bundle-manifest")) return "temporarily-not-json";
		throw new Error(`unexpected_url:${url}`);
	};

	try {
		delete require.cache[require.resolve("../lib/self-update.js")];
		const Update = require("../lib/self-update.js");
		const result = await Update.runUpdateCheck({ root, origin, force: true });
		assert.equal(result.ok, true);
		assert.equal(result.updateAvailable, true);
		assert.equal(result.descriptorAvailable, false);
		assert.equal(result.descriptorWarning.code, "descriptor_json_invalid");
		assert.equal(result.hash, manifestHash);

		const logs = [];
		Background.resetWarnings();
		assert.equal(Background.warnOnce(
			(level, message) => logs.push({ level, message }),
			result.descriptorWarning,
			"test",
			10000000
		), true);
		assert.equal(Background.warnOnce(
			(level, message) => logs.push({ level, message }),
			result.descriptorWarning,
			"test",
			10000001
		), false);
		assert.equal(logs.length, 1);
		assert.equal(logs[0].level, "warn");
		assert.doesNotMatch(logs[0].message, /at Object\.|node:internal/);

		console.log(JSON.stringify({
			ok: true,
			suite: "self-update-descriptor-tolerance",
			manifestDrivesNotification: true,
			metadataWarningIsBounded: true
		}, null, 2));
	} finally {
		Http.fetchText = originalFetch;
		fs.rmSync(root, { recursive: true, force: true });
	}
})().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
