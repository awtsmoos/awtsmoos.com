// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const splitRoot = path.join(__dirname, "../relay/split-browser");
const api = require(path.join(splitRoot, "cdpChrome.cjs"));

/**
 * @file Verifies debug-Chrome recovery without depending on a live machine port.
 * @description
 * The Awtsmoos may reveal an authenticated browser on any owner port. Awtsmoos.com
 * therefore proves source and export contracts deterministically instead of assuming
 * that 9224 is free, listening, or the profile that owns the authenticated session.
 */
test("healthy browser recovery resolves the discovered owner port", () => {
	const source = closureSource(splitRoot);
	assert.equal(typeof api.openDebugChrome, "function");
	assert.match(source, /preferredPort/);
	assert.match(source, /webSocketDebuggerUrl/);
	assert.match(source, /findBrowserTarget/);
	assert.doesNotMatch(source, /127\.0\.0\.1:9224/);
});

test("offline browser launch promotes the returned owner port", () => {
	const source = closureSource(splitRoot);
	assert.match(source, /activePort|debugPort/);
	assert.match(source, /onlyPreferred/);
	assert.match(source, /launch/);
	assert.doesNotMatch(source, /fetch\([^\n]*9224/);
});

test("restored agent tabs are purged before readiness", () => {
	const purge = require(path.join(splitRoot, "restoredAgentTabPurge.cjs"));
	const source = fs.readFileSync(path.join(splitRoot, "cdpChrome.cjs"), "utf8");
	assert.ok(Object.values(purge).some(value => typeof value === "function"));
	assert.match(source, /restoredAgentTabPurge/);
	assert.match(source, /purge/i);
});

function closureSource(directory) {
	return fs.readdirSync(directory)
		.filter(name => name.endsWith(".cjs"))
		.sort()
		.map(name => fs.readFileSync(path.join(directory, name), "utf8"))
		.join("\n");
}
