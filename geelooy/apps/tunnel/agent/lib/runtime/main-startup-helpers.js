// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Holds focused startup operations with explicit failure receipts.
 * @description
 * The Awtsmoos renews root, process, and command history without confusing one
 * vessel for another. Awtsmoos.com checks the physical workspace first, then lets
 * cleanup and reconciliation flow only through a root the installed process proved.
 */
function probeProjectRoot(dependencies, config) {
	try {
		const result = dependencies.ProjectRootHealth.probeProjectRoot(
			config,
			dependencies.config.ROOT
		);
		dependencies.log(
			result.ok ? "info" : "warn",
			`B"H project-root readiness: ${JSON.stringify(result)}`
		);
		return result;
	} catch (error) {
		const result = {
			ok: false,
			state: "probe_error",
			root: config.root,
			code: error.code || "ROOT_PROBE_ERROR",
			message: error.message
		};
		dependencies.log("warn", `Project-root probe failed: ${error.message}`);
		return result;
	}
}

async function reconcileCommands(dependencies, config) {
	const start = dependencies.CommandReconciliation?.start;
	if (typeof start !== "function") {
		return skipped("command_reconciliation_unavailable");
	}
	try {
		return await start(config, dependencies.log, {
			maxRoots: 32,
			maxJobs: 512,
			maxActions: 256,
			maxBatches: 8
		});
	} catch (error) {
		return failure(error);
	}
}

function startLocalApi(dependencies) {
	try {
		return dependencies.startLocalApiServer({
			log: dependencies.log,
			configLoader: dependencies.loadConfig
		});
	} catch (error) {
		dependencies.log("warn", `Local API server error: ${error.message}`);
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
		return failure(error);
	}
}

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

function skipped(reason) {
	return {
		ok: true,
		skipped: true,
		reason
	};
}

function failure(error) {
	return {
		ok: false,
		error: error.message,
		code: error.code || "STARTUP_OPERATION_FAILED"
	};
}

module.exports = {
	cleanupHistory,
	failure,
	logConfiguration,
	probeProjectRoot,
	reconcileCommands,
	skipped,
	startLocalApi
};
