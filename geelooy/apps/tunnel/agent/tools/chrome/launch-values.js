// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Normalizes Chrome launch intent into one bounded process-readiness covenant.
 * @description
 * The Awtsmoos gives every launch a port, profile, budget, and truthful scope;
 * Awtsmoos.com keeps those values small and explicit so startup cannot swallow hope.
 */

function settings(payload = {}, dependencies = {}) {
	const config = dependencies.loadConfig();
	const port = Number(param(payload, "port", config.chrome.port || 9222));
	const chromePath = param(payload, "chromePath", config.chrome.path || dependencies.findChrome());
	const userDataDir = param(
		payload,
		"userDataDir",
		config.chrome.userDataDir || dependencies.path.join(dependencies.ROOT, "chrome-profile")
	);
	const headless = dependencies.boolish(
		param(payload, "headless", undefined),
		dependencies.boolish(config.chrome.headless, false)
	);
	const url = launchUrl(payload);
	const effectiveUrl = dependencies.safeLaunchUrl(url);
	const attempts = boundedInteger(param(payload, "launchAttempts", 2), 1, 3, 2);
	const totalStartupMs = boundedInteger(
		param(payload, "startupTimeoutMs", Math.min(Number(param(payload, "timeoutMs", 10000)), 10000)),
		2000,
		12000,
		10000
	);

	return {
		args: dependencies.chromeLaunchArgs({ port, userDataDir, headless, url }),
		attempts,
		blocked: !config.chrome.enabled || !config.tools.chrome,
		chromePath,
		config,
		effectiveUrl,
		headless,
		perAttemptMs: Math.max(1000, Math.floor(totalStartupMs / attempts)),
		persist: param(payload, "persist", true) !== false,
		port,
		reuseExisting: dependencies.boolish(param(payload, "reuseExisting", true), true),
		startupWaitMs: boundedInteger(param(payload, "startupWaitMs", 250), 0, 1000, 250),
		url,
		userDataDir
	};
}

function targetOptions(payload = {}) {
	return {
		agentSessionId: param(payload, "agentSessionId", ""),
		browserSessionId: param(payload, "browserSessionId", ""),
		force: payload.force === true,
		inspectShared: payload.inspectShared === true,
		logicalAgentId: param(payload, "logicalAgentId", ""),
		missionId: param(payload, "missionId", ""),
		roomId: param(payload, "roomId", ""),
		shared: payload.shared === true
	};
}

function persist(settingsValue, dependencies = {}) {
	if (!settingsValue.persist) return false;
	dependencies.saveConfigPatch({
		chrome: {
			chromePath: settingsValue.chromePath,
			enabled: true,
			headless: settingsValue.headless,
			path: settingsValue.chromePath,
			port: settingsValue.port,
			userDataDir: settingsValue.userDataDir
		},
		tools: { chrome: true }
	});
	return true;
}

function launchUrl(payload = {}) {
	for (const key of ["url", "href", "targetUrl", "p", "path"]) {
		const value = param(payload, key, "");
		if (String(value || "").trim()) return String(value).trim();
	}
	return "about:blank";
}

function param(payload, key, fallback = "") {
	return payload[key] ?? payload.params?.[key] ?? fallback;
}

function boundedInteger(value, minimum, maximum, fallback) {
	const number = Number(value);
	return Number.isFinite(number)
		? Math.max(minimum, Math.min(maximum, Math.floor(number)))
		: fallback;
}

module.exports = {
	boundedInteger,
	launchUrl,
	param,
	persist,
	settings,
	targetOptions
};
