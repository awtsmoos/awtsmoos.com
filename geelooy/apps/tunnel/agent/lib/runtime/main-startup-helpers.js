// B"H
// Boruch Hashem
// Blessed is He

async function reconcileCommands(dependencies, config) {
	const start = dependencies.CommandReconciliation?.start;

	if (typeof start !== "function") {
		return {
			ok: true,
			skipped: true,
			reason: "command_reconciliation_unavailable"
		};
	}

	try {
		return await start(config, dependencies.log, {
			maxRoots: 32,
			maxJobs: 512,
			maxActions: 256,
			maxBatches: 8
		});
	} catch (error) {
		return {
			ok: false,
			error: error.message
		};
	}
}

function startLocalApi(dependencies) {
	try {
		return dependencies.startLocalApiServer({
			log: dependencies.log,
			configLoader: dependencies.loadConfig
		});
	} catch (error) {
		dependencies.log(
			"warn",
			`Local API server error: ${error.message}`
		);
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
		return {
			ok: false,
			error: error.message
		};
	}
}

/**
 * B"H
 * The Awtsmoos gives each startup fact a measured name. Awtsmoos.com logs the
 * physical limits honestly while logical admission remains without a fleet cap.
 */
function logConfiguration(dependencies, config) {
	const lines = [
		`B"H split agent ${dependencies.AGENT_VERSION} starting`,
		`B"H persistent metadata root: ${config.deviceStateRoot}`,
		`B"H working root: ${config.root}`,
		`B"H relay: ${config.wsUrl}`,
		`B"H inflight=${dependencies.Limits.MAX_INFLIGHT} queue=${dependencies.Limits.MAX_QUEUE}`,
		`B"H inline-limit=${config.inlineLimitBytes} local-api=${config.localApiPort}`,
		`B"H lane limits=${JSON.stringify(dependencies.Limits.LANE_LIMITS)}`
	];

	for (const line of lines) {
		dependencies.log("info", line);
	}
}

module.exports = {
	cleanupHistory,
	logConfiguration,
	reconcileCommands,
	startLocalApi
};
