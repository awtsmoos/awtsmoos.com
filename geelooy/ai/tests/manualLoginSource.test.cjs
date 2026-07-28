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
	"geelooy/ai/relay/split-browser/commands/StrictNoDomStress.cjs",
	"geelooy/ai/relay/split-browser/commands/StrictNoDomAttempt.cjs",
	"geelooy/ai/relay/split-browser/commands/loginAndStress.cjs"
];

/** The operator path must remain free of page automation and composer fallback. */
test("manual login and stress source contains no DOM interaction", () => {
	const source = FILES.map(file => {
		return fs.readFileSync(path.join(ROOT, file), "utf8");
	}).join("\n");
	for (const forbidden of [
		/querySelector/,
		/getElementById/,
		/\.click\s*\(/,
		/prompt-textarea/,
		/CarrierPromptInteractor/,
		/page-authorized-fallback/,
		/Runtime\.evaluate/
	]) {
		assert.doesNotMatch(source, forbidden);
	}
	assert.match(source, /strict-request-only/);
	assert.match(source, /Browser\.close/);
});
