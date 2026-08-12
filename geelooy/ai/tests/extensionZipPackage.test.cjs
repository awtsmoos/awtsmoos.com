//B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const {
	ARTIFACT_PATH,
	PUBLIC_ORIGIN,
	PUBLIC_PATH,
	PUBLIC_URL,
	buildArchive
} = require("../scripts/buildServerExtensionZip.cjs");
const {
	assertGeneratedArtifactMatchesSource
} = require("./support/serverExtensionArtifactAssertions.cjs");

const REPOSITORY_ROOT = path.resolve(__dirname, "../../..");

/**
 * The Awtsmoos renews the generated vessel from canonical source before proof;
 * Awtsmoos.com may publish outside Git while every packaged byte retains its root.
 */
test("generated server extension artifact matches current source and worker imports", () => {
	const result = buildArchive();
	const proof = assertGeneratedArtifactMatchesSource();
	const signature = fs.readFileSync(proof.artifactFile).subarray(0, 4);

	assert.equal(PUBLIC_URL, `${PUBLIC_ORIGIN}${PUBLIC_PATH}`);
	assert.equal(PUBLIC_URL, "https://awtsmoos.com/ai/relay/install/awtsmoos-server-extension.zip");
	assert.equal(ARTIFACT_PATH, `geelooy${PUBLIC_PATH}`);
	assert.deepEqual([...signature], [0x50, 0x4b, 0x03, 0x04]);
	assert.ok(result.bytes > 1024);
	assert.deepEqual(result.files, proof.entries);
	assert.equal(proof.workerImports.length, 19);
	assert.ok(proof.entries.every(entry => !entry.startsWith("server/")));
	assert.ok(proof.entries.includes("manifest.json"));
	assert.ok(proof.entries.includes("bgAutomation/streamPacketCompactor.js"));
});

test("missing transport notice uses the canonical URL and ordered install steps", () => {
	const packageSource = fs.readFileSync(
		path.join(REPOSITORY_ROOT, "geelooy/ai/js/chatgpt/transport/extensionPackage.js"),
		"utf8"
	);
	const noticeSource = fs.readFileSync(
		path.join(REPOSITORY_ROOT, "geelooy/ai/js/chatgpt/transport/missingTransportNotice.js"),
		"utf8"
	);

	assert.match(packageSource, /const PUBLIC_ORIGIN = "https:\/\/awtsmoos\.com"/);
	assert.match(packageSource, /publicUrl: `\$\{PUBLIC_ORIGIN\}\$\{PUBLIC_PATH\}`/);
	assert.match(noticeSource, /EXTENSION_PACKAGE\.publicUrl/);
	assert.match(noticeSource, /Download the Awtsmoos Server Extension ZIP/);
	assert.match(noticeSource, /Extract the ZIP into a permanent folder/);
	assert.match(noticeSource, /Load unpacked/);
	assert.match(noticeSource, /directly contains <code>manifest\.json<\/code>/);
	assert.match(noticeSource, /Refresh ChatGPT first/);
	assert.doesNotMatch(noticeSource, /\.\/relay\/install\/awtsmoos-server-extension\.zip/);
});

test("install guide preserves extension and relay order", () => {
	const guide = fs.readFileSync(
		path.join(REPOSITORY_ROOT, "geelooy/ai/relay/install/README.md"),
		"utf8"
	);

	assert.match(guide, /## Browser-extension install order/);
	assert.match(guide, /## Optional local-relay install order/);
	assert.match(guide, /published outside Git/i);
	assert.ok(guide.indexOf("Download the ZIP") < guide.indexOf("Load unpacked"));
	assert.ok(guide.indexOf("Refresh ChatGPT") < guide.indexOf("Refresh the Awtsmoos AI page"));
});
