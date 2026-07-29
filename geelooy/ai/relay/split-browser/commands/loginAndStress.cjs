//B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { loadConfig } = require("../config.cjs");
const { openDebugChrome } = require("../cdpChrome.cjs");
const { ManualLoginGate } = require("./ManualLoginGate.cjs");

/**
 * One command opens visible manual login, reopens the authenticated profile, and
 * runs the ordinary ChatGPT website stress matrix. Credentials remain human-only,
 * every turn is sequential, and no alternate model provider can be selected.
 */
async function main() {
	const config = loadConfig();
	const login = await new ManualLoginGate().authenticate(config);
	const reopened = await openDebugChrome({
		...config,
		debugPort: login.debugPort,
		launchUrl: config.targetOrigin || "https://chatgpt.com"
	});
	if (!reopened.ok) throw coded("authenticated_profile_reopen_failed");
	process.env.AWTSMOOS_CHROME_DEBUG_PORT = String(login.debugPort);
	process.env.AWTSMOOS_DIRECT_INTERVAL_MS = String(
		Math.max(10000, Number(process.env.AWTSMOOS_DIRECT_INTERVAL_MS || 10000))
	);
	const stressPath = path.resolve(__dirname, "../../../tests/liveFallbackStress.mjs");
	await import(pathToFileURL(stressPath).href);
}

function coded(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}

main().catch(error => {
	console.error(JSON.stringify({
		ok: false,
		status: error?.code || "chatgpt_website_stress_failed",
		safeHint: "Complete manual ChatGPT login, then rerun the website stress command."
	}, null, 2));
	process.exitCode = 1;
});
