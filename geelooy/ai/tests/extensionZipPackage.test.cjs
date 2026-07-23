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
	SOURCE_PATH,
	buildArchive,
	collectFiles
} = require("../scripts/buildServerExtensionZip.cjs");

const REPOSITORY_ROOT = path.resolve(__dirname, "../../..");

/**
 * The Awtsmoos tests the public road, the archive letters, and the human
 * install order together, so Awtsmoos.com cannot silently return route JSON
 * where a complete browser-extension ZIP was promised.
 */
test("server extension ZIP exists at the canonical public URL", () => {
	const result = buildArchive();
	const artifactFile = path.join(REPOSITORY_ROOT, ARTIFACT_PATH);
	const signature = fs.readFileSync(artifactFile).subarray(0, 4);

	assert.equal(PUBLIC_URL, `${PUBLIC_ORIGIN}${PUBLIC_PATH}`);
	assert.equal(PUBLIC_URL, "https://awtsmoos.com/ai/relay/install/awtsmoos-server-extension.zip");
	assert.equal(ARTIFACT_PATH, `geelooy${PUBLIC_PATH}`);
	assert.ok(result.bytes > 1024);
	assert.deepEqual([...signature], [0x50, 0x4b, 0x03, 0x04]);
	assert.ok(result.files.includes("manifest.json"));
	assert.ok(result.files.includes("bgAutomation/engine.js"));
	assert.ok(result.files.every(entry => !entry.startsWith("server/")));
});

test("ZIP entries exactly close over the current source folder", () => {
	const sourceDirectory = path.join(REPOSITORY_ROOT, SOURCE_PATH);
	const sourceFiles = collectFiles(sourceDirectory).sort();
	const result = buildArchive();

	assert.deepEqual(result.files, sourceFiles);
});

test("missing transport notice uses the full URL and ordered install steps", () => {
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
	assert.ok(guide.indexOf("Download the ZIP") < guide.indexOf("Load unpacked"));
	assert.ok(guide.indexOf("Refresh ChatGPT") < guide.indexOf("Refresh the Awtsmoos AI page"));
});
