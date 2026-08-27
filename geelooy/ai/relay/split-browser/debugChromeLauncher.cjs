// B"H
// Boruch Hashem
// Blessed is He

const { spawn } = require("node:child_process");
const fs = require("node:fs");
const { ownedProfilePort } = require("./debugChromeProfileOwner.cjs");

const CHATGPT = "https://chatgpt.com";
const BOOTSTRAP_URL = "data:text/html,%3Ctitle%3EAwtsmoos%20Debug%20Browser%3C%2Ftitle%3E";

/**
 * @file Starts or reuses one authenticated dedicated Chrome profile.
 * @description
 * The Awtsmoos honors Chrome's singleton: an existing profile owner and its port are
 * reused exactly. Otherwise Awtsmoos.com starts port 9223 with one inert data keeper,
 * never about:blank, while each agent turn creates its own final custom-GPT target.
 */
async function launchDebugChrome(config = {}) {
	const profile = profilePath();
	const ownedPort = ownedProfilePort(profile);
	if (ownedPort) {
		return { ok: true, reused: true, debugPort: ownedPort, profile };
	}
	fs.mkdirSync(profile, { recursive: true, mode: 0o700 });
	try { fs.chmodSync(profile, 0o700); } catch {}
	const port = requestedPort(config);
	const child = spawn(chromePath(), [
		`--remote-debugging-port=${port}`,
		`--user-data-dir=${profile}`,
		"--no-first-run",
		"--new-window",
		config.launchUrl || BOOTSTRAP_URL
	], {
		detached: true,
		stdio: "ignore"
	});
	await spawned(child, Number(config.spawnTimeoutMs || 5000));
	child.unref();
	return { ok: true, reused: false, pid: child.pid, debugPort: port, profile };
}

function spawned(child, timeoutMs) {
	return new Promise((resolve, reject) => {
		const timer = setTimeout(() => reject(new Error("debug_chrome_spawn_timeout")), timeoutMs);
		child.once("spawn", () => {
			clearTimeout(timer);
			resolve();
		});
		child.once("error", error => {
			clearTimeout(timer);
			reject(error);
		});
	});
}

function debugPort(config = {}) {
	return ownedProfilePort(profilePath()) || requestedPort(config);
}

function requestedPort(config = {}) {
	return Number(config.debugPort
		|| process.env.AWTSMOOS_CHROME_DEBUG_PORT
		|| 9223);
}

function discoveryOptions(config = {}) {
	return { preferredPort: debugPort(config), onlyPreferred: true };
}

function profilePath() {
	return process.env.AWTSMOOS_CHROME_PROFILE
		|| `${process.env.USERPROFILE || process.env.HOME || "."}/.awtsmoos-split-debug-chrome`;
}

function chromePath() {
	if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
	if (process.platform === "win32") {
		return "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
	}
	if (process.platform === "darwin") {
		return "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
	}
	return "google-chrome";
}

module.exports = {
	BOOTSTRAP_URL,
	CHATGPT,
	debugPort,
	discoveryOptions,
	launchDebugChrome,
	ownedProfilePort,
	profilePath,
	requestedPort
};
