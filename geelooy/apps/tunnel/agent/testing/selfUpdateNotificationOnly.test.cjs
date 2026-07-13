// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Http = require("../lib/self-update-http.js");

/**
 * B"H
 *
 * Proves that update discovery cannot overwrite a live runtime or restart its
 * process. The Awtsmoos reveals the new version as information only; the tested
 * transactional installer remains the sole activation authority on Awtsmoos.com.
 *
 * @returns {Promise<void>}
 * 	Resolves after the immutable-runtime assertions and cleanup complete.
 */
async function main() {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-update-notify-"));
	const sentinel = path.join(root, "sentinel.txt");
	const manifest = 'B"H\n9.9.9\nmain.js\nlib/example.js\n';
	const manifestSha256 = crypto
		.createHash("sha256")
		.update(manifest)
		.digest("hex");
	const originalFetchText = Http.fetchText;

	fs.writeFileSync(sentinel, "living-runtime\n");
	fs.writeFileSync(path.join(root, "install-state.txt"), "1.0.0\n");
	fs.writeFileSync(path.join(root, "install-manifest.sha256"), "old-hash\n");

	Http.fetchText = createFetchStub(manifest, manifestSha256);

	try {
		delete require.cache[require.resolve("../lib/self-update.js")];
		const Update = require("../lib/self-update.js");
		const result = await Update.runUpdateCheck({
			root,
			origin: "https://awtsmoos.com",
			force: true
		});

		assert.equal(result.ok, true);
		assert.equal(result.updated, false);
		assert.equal(result.updateAvailable, true);
		assert.equal(result.activation, "transactional_installer_required");
		assert.equal(fs.readFileSync(sentinel, "utf8"), "living-runtime\n");
		assert.equal(Update.restartIntoUpdatedAgent().restarted, false);

		console.log(JSON.stringify({
			ok: true,
			suite: "self-update-notification-only",
			version: result.version,
			activation: result.activation,
			command: result.command
		}, null, 2));
	} finally {
		Http.fetchText = originalFetchText;
		fs.rmSync(root, { recursive: true, force: true });
	}
}

/**
 * B"H
 *
 * Creates a deterministic Yesod transport stub so no network light enters the
 * test vessel. Each accepted URL returns one exact release receipt.
 *
 * @param {string} manifest
 * 	Exact manifest bytes announced by the release server.
 * @param {string} manifestSha256
 * 	SHA-256 matching those exact bytes.
 * @returns {(url: string) => Promise<string>}
 * 	Asynchronous replacement for the update HTTP text reader.
 */
function createFetchStub(manifest, manifestSha256) {
	return async url => {
		if (url.endsWith("/manifest.txt")) {
			return manifest;
		}

		if (url.endsWith("/bundle-manifest")) {
			return JSON.stringify({
				ok: true,
				version: "9.9.9",
				manifestSha256,
				bundles: [{
					name: "agent",
					url: "/api/tunnel/install/agent.zip",
					sha256: "bundle-sha",
					bytes: 1234
				}]
			});
		}

		throw new Error(`unexpected_url:${url}`);
	};
}

main().catch(error => {
	console.error(error && (error.stack || error.message || String(error)));
	process.exitCode = 1;
});
