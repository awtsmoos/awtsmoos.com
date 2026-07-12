// B"H

/**
 * B"H — Startup reconciles orphaned command families before accepting new work,
 * then opens local control, mission memory, updates, and the relay sight-line.
 */
function createStartupRuntime(dependencies) {
	async function main() {
		const config = dependencies.loadConfig();
		logConfiguration(dependencies, config);
		const cleanup = cleanupHistory(dependencies, config);
		dependencies.log(cleanup.ok ? 'info' : 'warn', `B"H startup cleanup: ${JSON.stringify(cleanup.summary || cleanup)}`);
		const commandReconciliation = await dependencies.CommandReconciliation.start(
			config,
			dependencies.log,
			{
				maxRoots: 32,
				maxJobs: 512,
				maxActions: 256,
				maxBatches: 8
			}
		).catch(error => ({ ok: false, error: error.message }));
		const localApiServer = startLocalApi(dependencies);
		const boot = dependencies.Boot.start(dependencies.log);
		const update = dependencies.Updates.scheduleSelfUpdate({
			config,
			log: dependencies.log,
			reason: 'startup_after_local_api'
		});
		const socket = dependencies.connection.connect();
		const openedControl = dependencies.shouldOpenControl?.()
			? Boolean(dependencies.openHostedControl(config))
			: false;
		return {
			ok: cleanup.ok !== false && commandReconciliation.ok !== false,
			action: 'agentStartup',
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

function startLocalApi(dependencies) {
	try {
		return dependencies.startLocalApiServer({
			log: dependencies.log,
			configLoader: dependencies.loadConfig
		});
	} catch (error) {
		dependencies.log('warn', `Local API server error: ${error.message}`);
		return null;
	}
}

function cleanupHistory(dependencies, config) {
	try {
		return dependencies.HistoryCleanup.cleanupAwtsmoosState({
			projectRoot: config.root,
			stateRoot: config.deviceStateRoot,
			dryRun: false
		});
	} catch (error) {
		return { ok: false, error: error.message };
	}
}

function logConfiguration(dependencies, config) {
	dependencies.log('info', `B"H split agent ${dependencies.AGENT_VERSION} starting`);
	dependencies.log('info', `B"H persistent metadata root: ${config.deviceStateRoot}`);
	dependencies.log('info', `B"H working root: ${config.root}`);
	dependencies.log('info', `B"H relay: ${config.wsUrl}`);
	dependencies.log('info', `B"H inflight=${dependencies.Limits.MAX_INFLIGHT} queue=${dependencies.Limits.MAX_QUEUE}`);
	dependencies.log('info', `B"H inline-limit=${config.inlineLimitBytes} local-api=${config.localApiPort}`);
	dependencies.log('info', `B"H lane limits=${JSON.stringify(dependencies.Limits.LANE_LIMITS)}`);
}

module.exports = { cleanupHistory, createStartupRuntime, logConfiguration, startLocalApi };
