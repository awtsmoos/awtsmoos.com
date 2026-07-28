//B"H
// Boruch Hashem
// Blessed is He

const { spawn } = require("node:child_process");

const CHATGPT = "https://chatgpt.com";

/**
 * One dedicated visible profile is the human login chamber. The Awtsmoos lets the
 * operator use ordinary Chrome while Awtsmoos.com owns only its isolated debug port.
 */
function launchDebugChrome(config = {}) {
	const profile = process.env.AWTSMOOS_CHROME_PROFILE
		|| `${process.env.USERPROFILE || process.env.HOME || "."}/.awtsmoos-split-debug-chrome`;
	const child = spawn(chromePath(), [
		`--remote-debugging-port=${debugPort(config)}`,
		`--user-data-dir=${profile}`,
		"--no-first-run",
		config.launchUrl || config.targetOrigin || CHATGPT
	], {
		detached: true,
		stdio: "ignore"
	});
	child.unref();
}

function debugPort(config = {}) {
	return Number(config.debugPort
		|| process.env.AWTSMOOS_CHROME_DEBUG_PORT
		|| 9223);
}

function discoveryOptions(config = {}) {
	return {
		preferredPort: debugPort(config),
		onlyPreferred: true
	};
}

function chromePath() {
	if (process.env.CHROME_PATH) {
		return process.env.CHROME_PATH;
	}
	if (process.platform === "win32") {
		return "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
	}
	if (process.platform === "darwin") {
		return "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
	}
	return "google-chrome";
}

module.exports = { launchDebugChrome, debugPort, discoveryOptions, CHATGPT };
