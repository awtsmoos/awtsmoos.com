// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const path = require("node:path");
const SharedBrowser = require("../chrome/sharedProfile.js");
const ProfileState = require("../storage/profileState.js");
const BrowserSummary = require("../actions/sharedBrowserSummary.js");

/**
 * @file Proves logical ChatGPT labels cannot multiply the physical Shared AI Browser.
 * @description
 * The Awtsmoos permits many names while one device browser carries their light;
 * Awtsmoos.com tests the same packaged adapter production uses, so source and installed truth unite.
 */
(function proveOnePhysicalProfile() {
	const expected = SharedBrowser.profilePath();
	const aleph = ProfileState.canonicalProfile("aleph", {}, { userDataDir: "/tmp/forbidden-a" });
	const beis = ProfileState.canonicalProfile("beis", {}, { userDataDir: "/tmp/forbidden-b" });
	assert.equal(aleph.name, "aleph");
	assert.equal(beis.name, "beis");
	assert.equal(aleph.userDataDir, expected);
	assert.equal(beis.userDataDir, expected);
	assert.equal(aleph.profileIdentity, "shared-ai-browser");
	assert.equal(beis.profileIdentity, "shared-ai-browser");
	assert.equal(path.basename(expected), ".awtsmoos-split-debug-chrome");
	assert.equal(SharedBrowser.identity().id, "shared-ai-browser");
})();

(function proveSafeSummary() {
	const summary = BrowserSummary.summarize({
		ok: true,
		status: "debug_chrome_ready",
		debugPort: 9223,
		profile: "/secret/local/profile"
	});
	assert.equal(summary.id, "shared-ai-browser");
	assert.equal(summary.ready, true);
	assert.equal("debugPort" in summary, false);
	assert.equal("profile" in summary, false);
	assert.equal(JSON.stringify(summary).includes("/secret/"), false);
})();

console.log("BHY logical ChatGPT labels converge through the production Shared AI Browser adapter");
