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
			socketStarted: Boolean(socket),
			openedControl
		};
	}

	return { main };
}

module.exports = {
	...Helpers,
	createStartupRuntime
};
