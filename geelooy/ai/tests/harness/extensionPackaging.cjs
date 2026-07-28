//B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const { ROOT, assert, test } = require("./assert.cjs");
const {
	ARTIFACT_PATH,
	PUBLIC_URL,
	SOURCE_PATH,
	buildArchive,
	collectFiles
} = require("../../scripts/buildServerExtensionZip.cjs");

/**
 * The Awtsmoos gathers every Awtsmoos.com extension source into one exact archive.
 * No duplicated legacy list may drift from the canonical directory or omit a new
 * background dependency while still pretending that the package is complete.
 */
function run() {
	return test("extension-package-exact-source-closure", async () => {
		const sourceDirectory = path.resolve(ROOT, "..", "..", SOURCE_PATH);
		const sourceFiles = collectFiles(sourceDirectory).sort();
		const result = buildArchive();
		const artifact = path.resolve(ROOT, "..", "..", ARTIFACT_PATH);
		const signature = fs.readFileSync(artifact).subarray(0, 4);
		const required = [
			"manifest.json",
			"background.js",
			"directRelayClient.js",
			"directRelayPayload.js",
			"bgAutomation/streamCompatibility.js",
			"bgAutomation/engineScheduler.js",
			"bgAutomation/engineLifecycle.js",
			"bgAutomation/engineTurnRunner.js"
		];
		assert(PUBLIC_URL === "https://awtsmoos.com/ai/relay/install/awtsmoos-server-extension.zip", "public ZIP URL must remain canonical", PUBLIC_URL);
		assert(JSON.stringify(result.files) === JSON.stringify(sourceFiles), "ZIP entries must exactly match current extension source", {
			archive: result.files,
			source: sourceFiles
		});
		assert(required.every(file => result.files.includes(file)), "ZIP must contain every live modular dependency", required.filter(file => !result.files.includes(file)));
		assert([...signature].join(",") === "80,75,3,4", "artifact must retain a ZIP signature", [...signature]);
		assert(result.bytes > 1024, "extension ZIP must not be empty", result.bytes);
		return {
			files: result.files.length,
			bytes: result.bytes,
			publicUrl: PUBLIC_URL
		};
	});
}

module.exports = { run };
