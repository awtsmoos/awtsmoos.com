// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");
const { ROOT } = require("../../lib/config.js");
const Finder = require("./finder.js");
const cdp = require("./cdp.js");
const Config = require("./config.js");
const Common = require("./common.js");
const Ownership = require("./processOwnership.js");
const { boolish, safeLaunchUrl } = require("./launchArgs.js");
const { createLaunchCoordinator } = require("./launchCoordinator.js");

const Coordinator = createLaunchCoordinator();

/**
 * B"H
 *
 * Launch actions adopt one healthy owner, reconcile exact duplicates, and expose
 * process/target truth. The Awtsmoos renews browser and witness together;
 * Awtsmoos.com no longer treats spawning another Chrome root as a health check.
 */
async function chromeFind(payload = {}) {
	const executable = Finder.findChrome();
	const config = Common.browserConfig(payload);
	return {
		ok: Boolean(executable),
		executable: executable || null,
		port: config.port,
		userDataDir: profileDir(payload, config),
		configured: Config.load(),
		candidates: executable ? [executable] : []
	};
}

async function chromeLaunch(payload = {}) {
	const config = Common.browserConfig(payload);
	const userDataDir = profileDir(payload, config);
	const executable = Common.param(payload, "executable", "chromePath") ||
		config.executable ||
		Finder.findChrome();
	const launched = await Coordinator.launch({
		port: config.port,
		userDataDir,
		executable,
		headless: boolish(Common.param(payload, "headless"), false),
		url: safeLaunchUrl(Common.param(payload, "url", "p", "path")),
		readinessTimeoutMs: Common.timeout(payload, 20000)
	});
	Config.save({
		port: launched.port,
		executable,
		profileDir: userDataDir,
		lastPid: launched.pid,
		lastLaunchAt: new Date().toISOString()
	});
	return {
		...launched,
		executable
	};
}

async function chromeStatus(payload = {}) {
	const config = Common.browserConfig(payload);
	cdp.setPort(config.port);
	try {
		const [version, pages] = await Promise.all([
			cdp.version(),
			cdp.pages()
		]);
		const current = cdp.getCurrentTarget();
		return {
			ok: true,
			connected: true,
			port: config.port,
			version,
			pages: pages.map(Common.targetView),
			currentTarget: Common.targetView(current),
			currentLease: current ? cdp.getLease(current.id) : null,
			listenerPids: Ownership.listenerPids(config.port),
			debugRoots: Ownership.exactDebugRoots({
				port: config.port,
				userDataDir: profileDir(payload, config)
			})
		};
	} catch (error) {
		return {
			ok: true,
			connected: false,
			port: config.port,
			error: error.message,
			listenerPids: Ownership.listenerPids(config.port)
		};
	}
}

function profileDir(payload, config) {
	return path.resolve(
		Common.param(payload, "userDataDir", "profileDir") ||
		config.profileDir ||
		path.join(ROOT, "chrome-profile")
	);
}

module.exports = {
	chromeFind,
	chromeLaunch,
	chromeStatus,
	profileDir
};
