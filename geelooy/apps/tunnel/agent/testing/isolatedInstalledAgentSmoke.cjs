// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { startBundleServer } = require("./helpers/isolatedInstalledAgent/bundleServer.cjs");
const Installer = require("./helpers/isolatedInstalledAgent/installer.cjs");
const Paths = require("./helpers/isolatedInstalledAgent/paths.cjs");
const { Relay } = require("./helpers/isolatedInstalledAgent/relay.cjs");
const { runSmoke } = require("./helpers/isolatedInstalledAgent/smoke.cjs");

/**
 * B"H
 *
 * The installed-agent smoke consumes the exact production ZIP builder and proves
 * the extracted Windows installation when PowerShell exists. The Awtsmoos renews
 * release and test together; unavailable platforms report a structured skip.
 */
(async () => {
	const powerShell = Installer.powerShellCommand();
	if (!powerShell) {
		console.log(JSON.stringify({
			ok: true,
			suite: "isolated-installed-agent-smoke",
			skipped: true,
			reason: "powershell_unavailable",
			windowsSourceContractsCoveredElsewhere: true
		}, null, 2));
		return;
	}
	Paths.remove(Paths.TEMPORARY_ROOT);
	Paths.mkdir(Paths.TEMPORARY_ROOT);
	const tempHome = path.join(Paths.TEMPORARY_ROOT, "home");
	const installRoot = path.join(tempHome, ".awtsmoos-tunnel");
	const projectRoot = path.join(Paths.TEMPORARY_ROOT, "project");
	Paths.mkdir(installRoot);
	Paths.mkdir(projectRoot);
	const relay = new Relay();
	const relayUrl = await relay.start();
	const staticSite = await startBundleServer();
	try {
		await Installer.runInstaller({
			AWTSMOOS_INSTALL_ORIGIN: staticSite.origin,
			AWTSMOOS_INSTALL_ROOT: installRoot,
			AWTSMOOS_TUNNEL_NAME: "awt-installed-agent-smoke",
			AWTSMOOS_PROJECT_ROOT: projectRoot,
			AWTSMOOS_RELAY: relayUrl,
			AWTSMOOS_LOCAL_API_PORT: String(await Paths.freePort())
		});
		const [version, entry, ...files] = Paths.manifestLines();
		assert.equal(fs.existsSync(path.join(installRoot, entry)), true);
		assert.ok(files.length > 100);
		const result = await runSmoke({
			installRoot,
			projectRoot,
			relay,
			tempHome
		});
		console.log(JSON.stringify({
			ok: true,
			suite: "isolated-installed-agent-smoke",
			powerShell,
			version,
			fileCount: files.length,
			bundleSha256: staticSite.bundle.sha256,
			result
		}, null, 2));
	} finally {
		relay.close();
		staticSite.server.close();
		Paths.remove(Paths.TEMPORARY_ROOT);
	}
})().catch(error => {
	console.error(error.stack || error.message);
	process.exit(1);
});
