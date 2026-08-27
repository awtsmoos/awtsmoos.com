// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Shapes bounded Chrome launch evidence into compact terminal responses.
 * @description
 * The Awtsmoos makes a truthful end from every bounded beginning;
 * Awtsmoos.com returns ownership, readiness, and target evidence without navigation clinging.
 */
function success(intent, pid, target, readiness, attempt, reusedExisting, dependencies) {
	return {
		ok: true,
		action: "chromeLaunch",
		ready: true,
		chromePath: intent.chromePath,
		chromeTargetId: target.chromeTargetId,
		headless: intent.headless,
		launchAttempt: attempt,
		pid,
		port: intent.port,
		readiness,
		reusedExisting,
		userDataDir: intent.userDataDir,
		logs: launchLogs(dependencies)
	};
}

function disabled() {
	return {
		ok: false,
		action: "chromeLaunch",
		error: "chrome_disabled"
	};
}

function missingChrome(dependencies) {
	return {
		ok: false,
		action: "chromeLaunch",
		error: "chrome_not_found",
		...dependencies.chromeFindDetails()
	};
}

function unownedPort(intent) {
	return {
		ok: false,
		action: "chromeLaunch",
		error: "chrome_port_in_use_unowned",
		port: intent.port,
		userDataDir: intent.userDataDir
	};
}

function alreadyInUse(intent, record) {
	return {
		ok: false,
		action: "chromeLaunch",
		error: "chrome_port_already_in_use",
		owned: true,
		pid: record.pid,
		port: intent.port
	};
}

function launchLogs(dependencies) {
	return dependencies.compactLogs(
		dependencies.readChromeLogs({ maxLogs: 20 }),
		20
	);
}

module.exports = {
	alreadyInUse,
	disabled,
	launchLogs,
	missingChrome,
	success,
	unownedPort
};
