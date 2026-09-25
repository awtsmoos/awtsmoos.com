//B"H
//Boruch Hashem
//Blessed be He

const { spawn } = require("node:child_process");
const fs = require("node:fs");
const ActivePort = require("./debugChromeActivePort.cjs");
const Registry = require("./deviceBrowserRegistry.cjs");
const LaunchArgs = require("./debugChromeLaunchArgs.cjs");
const LaunchGate = require("./debugChromeLaunchGate.cjs");
const Owner = require("./debugChromeProfileOwner.cjs");
const SpawnPolicy = require("./debugChromeSpawnPolicy.cjs");
const SharedProfile = require("./sharedChromeProfile.cjs");
const RootGuard = require("./sharedChromeRootGuard.cjs");

const CHATGPT = "https://chatgpt.com";
const BOOTSTRAP_URL = "data:text/html,%3Ctitle%3EAwtsmoos%20Debug%20Browser%3C%2Ftitle%3E";

/**
 * @file Starts or reuses the one device-owned Chrome shared by every AI agent.
 * @description
 * The Awtsmoos trusts the selected profile owner rather than a magic port.
 * Fresh launches bind explicit IPv4 loopback and normally ask Chrome for an
 * OS-assigned DevTools port, then publish that actual endpoint to the registry.
 */
async function launchDebugChrome(config = {}) {
	const profile = profilePath(config);
	await RootGuard.reconcile(profile, Registry.read()?.pid);
	const existing = await Registry.observe({ profile });
	if (existing.ok) return reusedOwner(existing);
	return LaunchGate.converge(async () => {
		const owner = await Registry.observe({ profile });
		if (owner.ok) return reusedOwner(owner);
		await RootGuard.reconcile(profile, Registry.read()?.pid);
		const root = await RootGuard.owner(profile);
		if (root) return RootGuard.blocked(root, profile);
		return spawnOwner(profile, config);
	});
}

/** Creates one browser owner only after the profile is proven ownerless. */
async function spawnOwner(profile, config = {}) {
	const pressure = await SpawnPolicy.assertSafe(config.pressureOptions || {});
	fs.mkdirSync(profile, { recursive: true, mode: 0o700 });
	try { fs.chmodSync(profile, 0o700); } catch {}
	const requested = requestedPort(config);
	if (requested === 0) ActivePort.clear(profile);
	const args = LaunchArgs.build({
		requested,
		profile,
		host: Registry.LOOPBACK_HOST,
		launchUrl: config.launchUrl || BOOTSTRAP_URL
	});
	const child = spawn(chromePath(), args, { detached: true, stdio: "ignore" });
	await spawned(child, Number(config.spawnTimeoutMs || 5000));
	const priority = SpawnPolicy.afterSpawn(child.pid, config.priorityOptions || {});
	const port = requested || await ActivePort.wait(profile, {
		timeoutMs: Number(config.devToolsPortTimeoutMs || 10000)
	});
	const authority = Registry.recordSpawn({
		pid: child.pid,
		port,
		profile,
		startedAt: await Owner.processStartedAt(child.pid)
	});
	child.unref();
	return { ok: true, reused: false, ...authority, pressure, priority };
}

/** Returns one stable result for the already-selected browser incarnation. */
function reusedOwner(authority) {
	return { ok: true, reused: true, ...authority };
}

/** Waits for process creation; CDP readiness is verified by cdpChrome. */
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

async function browserAuthority(config = {}) {
	return Registry.observe({ profile: profilePath(config) });
}

async function debugPort(config = {}) {
	const authority = await browserAuthority(config);
	return authority.ok ? authority.port : requestedPort(config);
}

async function discoveryOptions(config = {}) {
	const authority = await browserAuthority(config);
	return {
		host: Registry.LOOPBACK_HOST,
		preferredPort: authority.ok ? authority.port : requestedPort(config),
		onlyPreferred: true,
		expectedPid: authority.ok ? authority.pid : null,
		incarnationId: authority.ok ? authority.incarnationId : null
	};
}

function requestedPort(config = {}) { return SharedProfile.requestedPort(config); }
function profilePath(config = {}) { return Registry.selectedProfile({ profile: config.profile }); }
function chromePath() {
	if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
	if (process.platform === "win32") return "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
	if (process.platform === "darwin") return "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
	return "google-chrome";
}

module.exports = { BOOTSTRAP_URL, CHATGPT, browserAuthority, debugPort, discoveryOptions,
	launchDebugChrome, ownedProfilePort: Owner.ownedProfilePort, profilePath, requestedPort };
