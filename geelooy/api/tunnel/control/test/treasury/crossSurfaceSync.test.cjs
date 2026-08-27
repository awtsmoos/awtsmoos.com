// B"H
// Boruch Hashem
// Blessed is He

const assert = require("assert");
const fs = require("fs");
const path = require("path");

/** Proves Treasury doors and their shared portal guard remain one constellation. */
const ROOT = path.resolve(__dirname, "../../../../../..");
const FILES = {
	osStart: "geelooy/os/startMenu.js",
	codePalette: "geelooy/apps/code/js/command-palette/commands.js",
	treasuryGroup: "geelooy/apps/code/js/command-palette/groups/treasury.js",
	codeExecutor: "geelooy/apps/code/js/command-palette/executor.js",
	portalGuard: "geelooy/apps/code/js/actions/portalUrl.js",
	accountPanel: "geelooy/apps/code/js/session/account-panel.js"
};
const CRITICAL = [
	"/api/tunnel/control/treasury/home",
	"/api/tunnel/control/treasury/budgets",
	"/api/tunnel/control/treasury/marketplace",
	"/api/tunnel/control/treasury/graph",
	"/api/tunnel/control/bank",
	"/apps/tunnel-control/",
	"/apps/code/",
	"/os"
];

function run() {
	const text = Object.fromEntries(Object.entries(FILES).map(([key, file]) => {
		return [key, fs.readFileSync(path.join(ROOT, file), "utf8")];
	}));
	assertContains(text.osStart, [
		"TREASURY_LINKS",
		...CRITICAL.filter(url => url !== "/os")
	], "OS start menu");
	assertContains(text.codePalette, [
		"TREASURY_COMMANDS",
		"./groups/treasury.js"
	], "Code palette composer");
	assertContains(text.treasuryGroup, [
		"open-url:/api/tunnel/control/treasury/home",
		"/api/tunnel/control/treasury/forecast",
		"/api/tunnel/control/treasury/advisor",
		"/api/tunnel/control/treasury/reputation"
	], "Code Treasury command group");
	assertContains(text.codeExecutor, [
		"open-url:",
		"Blocked unsafe portal URL",
		"openPortalAction"
	], "Code palette executor");
	assertContains(text.portalGuard, [
		"ALLOWED_PROTOCOLS",
		"noopener,noreferrer",
		"portal_protocol_blocked"
	], "Shared portal guard");
	assertContains(text.accountPanel, [
		"PORTALS",
		"/api/tunnel/control/treasury/home",
		"/api/tunnel/control/treasury/budgets",
		"/api/tunnel/control/bank",
		"/apps/tunnel-control/",
		"/os"
	], "Code account panel");
	return { ok: true, surfaces: Object.keys(FILES), criticalUrls: CRITICAL.length };
}

function assertContains(text, needles, label) {
	for (const needle of needles) {
		assert(text.includes(needle), `${label} missing ${needle}`);
	}
}

module.exports = { run };
if (require.main === module) {
	console.log(JSON.stringify(run(), null, 2));
}
