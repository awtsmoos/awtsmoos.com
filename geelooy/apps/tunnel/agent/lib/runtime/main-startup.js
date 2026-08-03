// B"H
// Boruch Hashem
// Blessed is He

const Helpers = require("./main-startup-helpers.js");

/**
 * @file Coordinates startup without confusing connectivity with workspace health.
 * @description
 * The Awtsmoos renews filesystem, identity, and relay as distinct lights.
 * Awtsmoos.com proves the project root before cleanup, yet still opens the relay
 * when access is blocked so a remote agent can diagnose and repair the vessel.
 */
function createStartupRuntime(dependencies) {
	async function main() {
		const config = dependencies.loadConfig();
		Helpers.logConfiguration(dependencies, config);
		const projectRootHealth = Helpers.probeProjectRoot(dependencies, config);
		const cleanup = projectRootHealth.ok
			? Helpers.cleanupHistory(dependencies, config)
			: Helpers.skipped("project_root_unavailable");
		logOperation(dependencies, "startup cleanup", cleanup);
		const localApiServer = Helpers.startLocalApi(dependencies);
		const boot = dependencies.Boot.start(dependencies.log);
		const update = dependencies.Updates.scheduleSelfUpdate({
			config,
			log: dependencies.log,
			reason: "startup_after_local_api"
		});
		await ensureDeviceIdentity(dependencies, config);
		const filesystemExecutor = dependencies.FsExecutor?.warm?.() || null;
		const socket = dependencies.connection.connect();
		const commandReconciliation = projectRootHealth.ok
			? await Helpers.reconcileCommands(dependencies, config)
			: Helpers.skipped("project_root_unavailable");
		logOperation(
			dependencies,
			"command reconciliation",
			commandReconciliation
		);
		const websiteMissionsRecovered = recoverWebsiteMissions(
			dependencies,
			config
		);
		const openedControl = dependencies.shouldOpenControl?.()
			? Boolean(dependencies.openHostedControl(config))
			: false;

		return {
			ok: projectRootHealth.ok &&
				cleanup.ok !== false &&
				commandReconciliation.ok !== false,
			action: "agentStartup",
			tunnelName: config.tunnelName,
			projectRootHealth,
			cleanup,
			commandReconciliation,
			localApiStarted: Boolean(localApiServer),
			bootResumeEnabled: Boolean(boot),
			websiteMissionsRecovered,
			updateScheduled: update !== false,
			deviceIdentity: dependencies.DeviceIdentity.publicStatus(config),
			filesystemExecutor,
			socketStarted: Boolean(socket),
			openedControl
		};
	}

	return { main };
}

function recoverWebsiteMissions(dependencies, config) {
	try {
		const recovered = dependencies.WebsiteMissionRecovery?.recover?.(config);
		return Array.isArray(recovered) ? recovered.length : 0;
	} catch (error) {
		dependencies.log(
			"warn",
			`B\"H website mission startup recovery failed: ${error.message}`
		);
		return 0;
	}
}

async function ensureDeviceIdentity(dependencies, config) {
	const current = dependencies.DeviceIdentity.load(config);
	if (current.ok) return current;
	dependencies.log(
		"warn",
		"B\"H device pairing is required before tunnel registration."
	);
	return dependencies.DeviceIdentity.pair(config, {
		log: dependencies.log,
		openBrowser: process.env.AWTSMOOS_SKIP_PAIRING_BROWSER !== "1",
		timeoutMs: Number(
			process.env.AWTSMOOS_PAIRING_TIMEOUT_MS || 10 * 60 * 1000
		)
	});
}

function logOperation(dependencies, label, result) {
	dependencies.log(
		result.ok === false ? "warn" : "info",
		`B"H ${label}: ${JSON.stringify(result.summary || result)}`
	);
}

module.exports = {
	...Helpers,
	createStartupRuntime,
	ensureDeviceIdentity,
	logOperation,
	recoverWebsiteMissions
};
