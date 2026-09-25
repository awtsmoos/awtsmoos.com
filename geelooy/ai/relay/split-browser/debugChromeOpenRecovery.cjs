//B"H
//Boruch Hashem
//Blessed be He

const Pressure = require("./debugChromeLaunchPressure.cjs");

/**
 * @file Recovers one DevTools-unresponsive Shared AI Chrome without launch storms.
 * @description
 * A reused authenticated browser is preserved while the Mac is under pressure.
 * When pressure is healthy, recovery may terminate only the selected profile/PID,
 * then perform one bounded replacement through the globally serialized launcher.
 */
async function recover(options = {}) {
	const {
		config,
		first,
		firstLaunch,
		port,
		runtime,
		prepareReady
	} = options;
	const pressure = await Pressure.allowSpawn(config?.pressureOptions || {});
	if (!pressure.ok) {
		return deferred(first, firstLaunch, port, pressure);
	}
	const recovery = await runtime.closeStale(port, {
		pid: firstLaunch?.pid
	});
	if (!recovery.closed && firstLaunch?.reused !== false) {
		return {
			...first,
			ok: false,
			status: "debug_chrome_owner_preserved_unrecoverable",
			error: "The selected Chrome owner was unresponsive but could not be safely claimed for recovery.",
			debugPort: port,
			launch: firstLaunch,
			ownerPreserved: true,
			recoveryAttempted: false,
			pressure
		};
	}
	await runtime.sleep(recovery.closed ? 750 : 250);
	const secondLaunch = await runtime.launch({
		...config,
		debugPort: port
	});
	const secondConfig = {
		...config,
		debugPort: secondLaunch.debugPort
	};
	const second = await runtime.wait(secondConfig, 20000);
	if (!second.ok) {
		return {
			...second,
			recoveryAttempted: true,
			staleProcessesClosed: recovery.closed,
			launch: secondLaunch,
			pressure
		};
	}
	const ready = await prepareReady(
		secondConfig,
		{ ...second, launch: secondLaunch },
		runtime
	);
	return {
		...ready,
		recoveryAttempted: true,
		staleProcessesClosed: recovery.closed,
		pressure
	};
}

function deferred(first, firstLaunch, port, pressure) {
	return {
		...first,
		ok: false,
		status: "debug_chrome_recovery_deferred_resource_pressure",
		error: "Shared AI Chrome recovery was deferred to protect Tunnel and remote control responsiveness.",
		debugPort: port,
		launch: firstLaunch,
		ownerPreserved: true,
		recoveryAttempted: false,
		pressure
	};
}

module.exports = { recover };
