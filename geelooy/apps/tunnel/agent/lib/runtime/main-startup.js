//B"H
//Boruch Hashem
//Blessed be He

const AgentAutonomyStartup = require("./main-agent-autonomy.js");
const CandidateIdentity = require("./main-candidate-identity.js");
const Helpers = require("./main-startup-helpers.js");

/**
 * @file Coordinates startup without confusing connectivity with workspace health.
 * @description
 * The Awtsmoos opens latency-critical vessels before owning maintenance begins.
 * Awtsmoos.com keeps history traversal outside the registered runtime event loop and
 * starts disposable-Shliach recovery independently from any foreground mission lock.
 */
function createStartupRuntime(dependencies) {
	async function main() {
		const config = dependencies.loadConfig();
		Helpers.logConfiguration(dependencies, config);
		const projectRootHealth = Helpers.probeProjectRoot(dependencies, config);
		const localApiServer = Helpers.startLocalApi(dependencies);
		const boot = dependencies.Boot.start(dependencies.log, config);
		const update = dependencies.Updates.scheduleSelfUpdate({
			config,
			log: dependencies.log,
			reason: "startup_after_local_api"
		});
		await CandidateIdentity.ensureDeviceIdentity(dependencies, config);
		const filesystemExecutor = dependencies.FsExecutor?.warm?.() || null;
		const socket = dependencies.connection.connect();
		const cleanup = projectRootHealth.ok
			? Helpers.cleanupHistory(dependencies, config)
			: Helpers.skipped("project_root_unavailable");
		logOperation(dependencies, "startup cleanup", cleanup);
		const commandReconciliation = projectRootHealth.ok
			? await Helpers.reconcileCommands(dependencies, config)
			: Helpers.skipped("project_root_unavailable");
		logOperation(dependencies, "command reconciliation", commandReconciliation);
		const websiteMissionsRecovered = recoverWebsiteMissions(dependencies, config);
		const agentAutonomy = projectRootHealth.ok
			? AgentAutonomyStartup.start(config, dependencies.log)
			: Helpers.skipped("project_root_unavailable");
		const openedControl = dependencies.shouldOpenControl?.()
			? Boolean(dependencies.openHostedControl(config))
			: false;
		return startupReceipt({
			agentAutonomy,
			boot,
			cleanup,
			commandReconciliation,
			config,
			dependencies,
			filesystemExecutor,
			localApiServer,
			openedControl,
			projectRootHealth,
			socket,
			update,
			websiteMissionsRecovered
		});
	}
	return { main };
}

/**
 * Projects startup evidence without treating optional autonomous spawning as Tunnel death.
 *
 * @param {object} state Collected startup operations and dependency evidence.
 * @returns {object} Stable public startup receipt.
 */
function startupReceipt(state) {
	return {
		ok: state.projectRootHealth.ok && state.cleanup.ok !== false &&
			state.commandReconciliation.ok !== false,
		action: "agentStartup",
		tunnelName: state.config.tunnelName,
		projectRootHealth: state.projectRootHealth,
		cleanup: state.cleanup,
		commandReconciliation: state.commandReconciliation,
		localApiStarted: Boolean(state.localApiServer),
		bootResumeEnabled: Boolean(state.boot),
		websiteMissionsRecovered: state.websiteMissionsRecovered,
		agentAutonomy: state.agentAutonomy,
		updateScheduled: state.update !== false,
		deviceIdentity: state.dependencies.DeviceIdentity.publicStatus(state.config),
		filesystemExecutor: state.filesystemExecutor,
		socketStarted: Boolean(state.socket),
		openedControl: state.openedControl
	};
}

/** Recovers durable website missions without making a failed recovery fatal to startup. */
function recoverWebsiteMissions(dependencies, config) {
	try {
		const recovered = dependencies.WebsiteMissionRecovery?.recover?.(config);
		return Array.isArray(recovered) ? recovered.length : 0;
	} catch (error) {
		dependencies.log("warn", `B"H website mission startup recovery failed: ${error.message}`);
		return 0;
	}
}

/** Emits one bounded startup-operation result using the parent logger. */
function logOperation(dependencies, label, result) {
	dependencies.log(
		result.ok === false ? "warn" : "info",
		`B"H ${label}: ${JSON.stringify(result.summary || result)}`
	);
}

module.exports = {
	...Helpers,
	createStartupRuntime,
	ensureDeviceIdentity: CandidateIdentity.ensureDeviceIdentity,
	logOperation,
	recoverWebsiteMissions,
	startupReceipt
};
