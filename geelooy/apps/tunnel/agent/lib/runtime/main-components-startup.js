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
		// The Awtsmoos follows the living child across connection generations.
		fsHandler: payload => D.handleFs(payload, foundation.runtime?.state?.activeWs || connection.proxy),
		promotionHandler: () => promoteCandidate(D, foundation, connection),
		Boot: D.Boot,
		WebsiteMissionRecovery: D.WebsiteMissionRecovery,
		Updates: D.Updates,
		DeviceIdentity: D.DeviceIdentity,
		connection,
		openHostedControl: D.openHostedControl,
		shouldOpenControl: () => process.argv.includes("--open-control") &&
			process.env.AWTSMOOS_SKIP_OPEN_CONTROL !== "1"
	};
}

/** Re-registers the already-open candidate socket as owner after installer approval. */
function promoteCandidate(D, foundation, connection) {
	if (process.env.AWTSMOOS_REGISTRATION_MODE !== "candidate-probe") {
		return { ok: false, error: "candidate_promotion_not_available" };
	}
	if (!connection.proxy?.opened) {
		return { ok: false, error: "candidate_socket_not_open" };
	}
	const config = foundation.loadConfig();
	const identity = D.DeviceIdentity.load(config);
	if (identity.ok !== true) {
		return { ok: false, error: identity.error || "candidate_identity_unavailable" };
	}
	const packet = D.nativeRegistrationPacket({
		config,
		agentVersion: D.AGENT_VERSION,
		identity,
		limits: {},
		runtime: { promotion: true }
	});
	delete packet.registrationMode;
	const sent = connection.proxy.sendJson(packet);
	return {
		ok: sent === true,
		action: "candidatePromote",
		sent: sent === true,
		tunnelName: config.tunnelName
	};
}

function validateStartupDependencies(dependencies = {}) {
	const required = [
		"config",
		"loadConfig",
		"ProjectRootHealth",
		"HistoryCleanup",
		"DeviceIdentity",
		"WebsiteMissionRecovery",
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
	promoteCandidate,
	validateStartupDependencies
};
