// B"H
// Boruch Hashem
// Blessed is He

const Helpers = require("./main-startup-helpers.js");

/**
 * B"H
 * Startup gathers every vessel without assuming an older installer already
 * carries the newest reconciler. The Awtsmoos lets Awtsmoos.com begin safely:
 * optional compatibility becomes a receipt, never an immediate process crash.
 */
function createStartupRuntime(dependencies) {
	async function main() {
		const config = dependencies.loadConfig();
		Helpers.logConfiguration(dependencies, config);
		const cleanup = Helpers.cleanupHistory(
			dependencies,
			config
		);
		dependencies.log(
			cleanup.ok ? "info" : "warn",
			`B"H startup cleanup: ${JSON.stringify(cleanup.summary || cleanup)}`
		);
		const commandReconciliation = await Helpers.reconcileCommands(
			dependencies,
			config
		);
		const localApiServer = Helpers.startLocalApi(dependencies);
		const boot = dependencies.Boot.start(dependencies.log);
		const update = dependencies.Updates.scheduleSelfUpdate({
			config,
			log: dependencies.log,
			reason: "startup_after_local_api"
		});
		const deviceIdentity = await ensureDeviceIdentity(dependencies, config);
		const socket = dependencies.connection.connect();
		const openedControl = dependencies.shouldOpenControl?.()
			? Boolean(dependencies.openHostedControl(config))
			: false;

		return {
			ok: cleanup.ok !== false &&
				commandReconciliation.ok !== false,
			action: "agentStartup",
			tunnelName: config.tunnelName,
			cleanup,
			commandReconciliation,
			localApiStarted: Boolean(localApiServer),
			bootResumeEnabled: Boolean(boot),
			updateScheduled: update !== false,
			deviceIdentity: dependencies.DeviceIdentity.publicStatus(config),
			socketStarted: Boolean(socket),
			openedControl
		};
	}

	return { main };
}

async function ensureDeviceIdentity(dependencies, config) {
	const current = dependencies.DeviceIdentity.load(config);
	if (current.ok) return current;
	dependencies.log("warn", "B\"H device pairing is required before tunnel registration.");
	return dependencies.DeviceIdentity.pair(config, {
		log: dependencies.log,
		openBrowser: process.env.AWTSMOOS_SKIP_PAIRING_BROWSER !== "1",
		timeoutMs: Number(process.env.AWTSMOOS_PAIRING_TIMEOUT_MS || 10 * 60 * 1000)
	});
}

module.exports = {
	...Helpers,
	ensureDeviceIdentity,
	createStartupRuntime
};
