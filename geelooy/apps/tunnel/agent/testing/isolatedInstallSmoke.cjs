// B"H
const path = require('node:path');
const Bundle = require('./helpers/isolatedInstall/bundle.cjs');
const Installers = require('./helpers/isolatedInstall/installers.cjs');
const Paths = require('./helpers/isolatedInstall/paths.cjs');
const { Relay } = require('./helpers/isolatedInstall/relay.cjs');
const Smoke = require('./helpers/isolatedInstall/smoke.cjs');

/**
 * B"H — A complete temporary installation proves manifest, installer, relay,
 * registration, filesystem behavior, concurrency, and shutdown without touching
 * the user's living tunnel.
 */
async function main() {
	Paths.removeTree(Paths.TEMP_ROOT);
	Paths.makeDirectory(Paths.TEMP_ROOT);
	Installers.assertInstallerScripts();
	const tempHome = path.join(Paths.TEMP_ROOT, 'home');
	const installRoot = path.join(tempHome, '.awtsmoos-tunnel');
	const projectRoot = path.join(Paths.TEMP_ROOT, 'project');
	Paths.makeDirectory(installRoot);
	Paths.makeDirectory(projectRoot);
	const relay = new Relay();
	const relayUrl = await relay.start();
	const staticSite = await Bundle.startStaticServer(Paths.GEELOOY_ROOT);
	try {
		const localApiPort = await Paths.freePort();
		const installerOutput = await Installers.installWithPlatform({
			origin: staticSite.origin,
			installRoot,
			projectRoot,
			relay: relayUrl,
			localApiPort
		});
		const installed = Smoke.verifyInstall(installRoot);
		const smoke = await Smoke.smokeInstalled({
			installRoot,
			tempHome,
			projectRoot,
			relay
		});
		console.log(JSON.stringify({
			ok: true,
			suite: 'isolated-tunnel-install-smoke',
			installed: {
				version: installed.version,
				fileCount: installed.fileCount
			},
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
