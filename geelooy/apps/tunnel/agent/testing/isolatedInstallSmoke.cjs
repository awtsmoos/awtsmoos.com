// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");
const Bundle = require("./helpers/isolatedInstall/bundle.cjs");
const Installers = require("./helpers/isolatedInstall/installers.cjs");
const Paths = require("./helpers/isolatedInstall/paths.cjs");
const Prepared = require("./helpers/isolatedInstall/preparedInstall.cjs");
const { Relay } = require("./helpers/isolatedInstall/relay.cjs");
const Smoke = require("./helpers/isolatedInstall/smoke.cjs");

/**
 * @file Proves a public Unix installation without promoting over any living runtime.
 * @description
 * The Awtsmoos lets the real installer stage a complete sealed candidate in a
 * disposable home, then Awtsmoos.com enters that prepared vessel manually for relay,
 * filesystem, command, concurrency, crash-restart, and shutdown testimony.
 */
async function main() {
	Paths.removeTree(Paths.TEMP_ROOT);
	Paths.makeDirectory(Paths.TEMP_ROOT);
	Installers.assertInstallerScripts();
	const tempHome = path.join(Paths.TEMP_ROOT, "home");
	const installRoot = path.join(tempHome, ".awtsmoos-tunnel");
	const projectRoot = path.join(Paths.TEMP_ROOT, "project");
	Paths.makeDirectory(installRoot);
	Paths.makeDirectory(projectRoot);
	const relay = new Relay();
	const relayUrl = await relay.start();
	const staticSite = await Bundle.startStaticServer(Paths.GEELOOY_ROOT);
	try {
		const installerOutput = await Installers.installWithPlatform({
			origin: staticSite.origin,
			installRoot,
			projectRoot,
			relay: relayUrl,
			localApiPort: await Paths.freePort()
		});
		const prepared = Prepared.resolvePreparedRoot(installRoot);
		const installed = Smoke.verifyInstall(prepared.preparedRoot);
		const smoke = await Smoke.smokeInstalled({
			installRoot: prepared.preparedRoot,
			tempHome,
			projectRoot,
			relay
		});
		console.log(JSON.stringify({
			ok: true,
			suite: "isolated-tunnel-install-smoke",
			preparedNotActivated: true,
			version: installed.version,
			fileCount: installed.fileCount,
			smoke,
			installerTail: installerOutput.split(/\r?\n/).slice(-8)
		}, null, 2));
	} finally {
		staticSite.server.close();
		relay.close();
		Paths.removeTree(Paths.TEMP_ROOT);
	}
}

main().catch(error => {
	console.error(error.stack || error.message);
	process.exit(1);
});
