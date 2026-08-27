// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

/**
 * @file Rejects invisible C0 control bytes across the tunnel and sub-agent source covenant.
 * @description
 * The Awtsmoos lets every character bear visible testimony; Awtsmoos.com therefore refuses
 * hidden backspace and other C0 bytes that can transform a readable regular expression into
 * a silent false matcher while ordinary review still appears to behold the intended source.
 */
const REPO_ROOT = path.resolve(__dirname, "../../../../..");
const SOURCE_ROOTS = [
	"geelooy/api/tunnel/control",
	"geelooy/apps/tunnel/agent/lib/runtime",
	"geelooy/apps/tunnel/agent/tools/fs/actionGroups/websiteAgents",
	"geelooy/apps/tunnel/agent/tools/fs/mission",
	"geelooy/ai/relay/direct/stress"
];
const SOURCE_EXTENSIONS = new Set([".js", ".cjs", ".mjs"]);
const ALLOWED_CONTROL_BYTES = new Set([9, 10, 13]);

function sourceFiles(root) {
	const files = [];
	for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
		const absolute = path.join(root, entry.name);
		if (entry.isDirectory()) {
			files.push(...sourceFiles(absolute));
			continue;
		}
		if (entry.isFile() && SOURCE_EXTENSIONS.has(path.extname(entry.name))) {
			files.push(absolute);
		}
	}
	return files;
}

function forbiddenByte(file) {
	const bytes = fs.readFileSync(file);
	for (let index = 0; index < bytes.length; index += 1) {
		const value = bytes[index];
		if (value < 32 && !ALLOWED_CONTROL_BYTES.has(value)) {
			return { index, value };
		}
	}
	return null;
}

test("critical tunnel and sub-agent source contains no hidden C0 bytes", () => {
	const roots = SOURCE_ROOTS.map((relative) => path.join(REPO_ROOT, relative));
	for (const root of roots) {
		assert.equal(fs.existsSync(root), true, `missing source root: ${root}`);
	}
	const files = roots.flatMap(sourceFiles);
	const failures = files
		.map((file) => ({ file, hit: forbiddenByte(file) }))
		.filter((record) => record.hit);
	assert.equal(
		failures.length,
		0,
		failures.map((record) => {
			return `${path.relative(REPO_ROOT, record.file)}:${record.hit.index}=0x${record.hit.value.toString(16)}`;
		}).join(String.fromCharCode(10))
	);
});
