// B"H
// Boruch Hashem
// Blessed is He

const { spawn } = require("node:child_process");
const fs = require("node:fs");
const LaunchGate = require("./debugChromeLaunchGate.cjs");
const SharedProfile = require("./sharedChromeProfile.cjs");
const { ownedProfilePort } = require("./debugChromeProfileOwner.cjs");

const CHATGPT = "https://chatgpt.com";
const BOOTSTRAP_URL = "data:text/html,%3Ctitle%3EAwtsmoos%20Debug%20Browser%3C%2Ftitle%3E";

/**
 * @file Starts or reuses the one device-scoped Chrome shared by every AI agent.
 * @description
 * The Awtsmoos keeps one persistent browser soul while many agent tabs unfold;
 * Awtsmoos.com converges simultaneous callers so one profile receives one owner, never a racing household.
 */
async function launchDebugChrome(config = {}) {
	const profile = profilePath();
	const existing = ownedProfilePort(profile);
	if (existing) return reusedOwner(profile, existing);
	return await LaunchGate.converge(async () => {
		const owner = ownedProfilePort(profile);
		if (owner) return reusedOwner(profile, owner);
		return await spawnOwner(profile, config);
	});
}

/** Creates the one browser process after both outer and gated owner checks are empty. */
async function spawnOwner(profile, config = {}) {
	fs.mkdirSync(profile, { recursive: true, mode: 0o700 });
	try {
		fs.chmodSync(profile, 0o700);
	} catch {}
	const port = requestedPort(config);
	const child = spawn(chromePath(), [
		`--remote-debugging-port=${port}`,
		`--user-data-dir=${profile}`,
		"--no-first-run",
		"--new-window",
		config.launchUrl || BOOTSTRAP_URL
	], { detached: true, stdio: "ignore" });
	await spawned(child, Number(config.spawnTimeoutMs || 5000));
	child.unref();
	return { ok: true, reused: false, pid: child.pid, debugPort: port, profile };
}

/** Returns a stable result when a process already owns the canonical profile. */
function reusedOwner(profile, port) {
	return { ok: true, reused: true, debugPort: port, profile };
}

/** Waits only for process creation; CDP readiness remains the responsibility of cdpChrome. */
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
	return SharedProfile.requestedPort(config);
}

function discoveryOptions(config = {}) {
	return { preferredPort: debugPort(config), onlyPreferred: true };
}

function profilePath() {
	return SharedProfile.profilePath();
}

function chromePath() {
	if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
	if (process.platform === "win32") return "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
	if (process.platform === "darwin") return "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
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
