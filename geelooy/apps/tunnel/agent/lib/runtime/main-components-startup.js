// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Builds the complete startup dependency vessel from the composition root.
 * @description
 * The Awtsmoos renews configuration, workspace proof, identity, and connection as
 * distinct lights. Awtsmoos.com names every startup dependency in one tested place,
 * so a refactor cannot register successfully while silently omitting root readiness.
 */
function createStartupDependencies(D, foundation, connection) {
	return {
		config: D.config,
		loadConfig: foundation.loadConfig,
		log: foundation.log,
		AGENT_VERSION: D.AGENT_VERSION,
		Limits: D.Limits,
		ProjectRootHealth: D.ProjectRootHealth,
		HistoryCleanup: D.HistoryCleanup,
		FsExecutor: D.FsExecutor,
		CommandReconciliation: D.CommandReconciliation,
		startLocalApiServer: D.startLocalApiServer,
		Boot: D.Boot,
		Updates: D.Updates,
		DeviceIdentity: D.DeviceIdentity,
		connection,
		openHostedControl: D.openHostedControl,
		shouldOpenControl: () => process.argv.includes("--open-control") &&
			process.env.AWTSMOOS_SKIP_OPEN_CONTROL !== "1"
	};
}

function validateStartupDependencies(dependencies = {}) {
	const required = [
		"config",
		"loadConfig",
		"ProjectRootHealth",
		"HistoryCleanup",
		"DeviceIdentity",
		"connection"
	];
	const missing = required.filter(name => !dependencies[name]);
	if (missing.length) {
		const error = new Error(`startup_dependencies_missing:${missing.join(",")}`);
		error.code = "STARTUP_DEPENDENCIES_MISSING";
		error.missing = missing;
		throw error;
	}
	return dependencies;
}

module.exports = {
	createStartupDependencies,
	validateStartupDependencies
};
