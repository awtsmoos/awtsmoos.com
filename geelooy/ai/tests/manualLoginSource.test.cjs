//B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const ROOT = path.resolve(__dirname, "../../..");
const FILES = [
	"geelooy/ai/relay/split-browser/cdpChrome.cjs",
	"geelooy/ai/relay/split-browser/debugChromeCookies.cjs",
	"geelooy/ai/relay/split-browser/commands/ManualLoginGate.cjs",
	"geelooy/ai/relay/split-browser/commands/loginOnly.cjs"
];

/** Manual authentication observes status but never enters credentials or clicks login. */
test("manual login source contains no credential automation", () => {
	const source = FILES.map(file => {
		return fs.readFileSync(path.join(ROOT, file), "utf8");
	}).join("\n");
	for (const forbidden of [
		/querySelector/,
		/getElementById/,
		/\.click\s*\(/,
		/prompt-textarea/,
		/Runtime\.evaluate/,
		/Input\.insertText/,
		/Input\.dispatchKeyEvent/
	]) {
		assert.doesNotMatch(source, forbidden);
	}
	assert.match(source, /Browser\.close/);
	assert.match(source, /logged_in/);
});
