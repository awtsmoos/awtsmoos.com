// B"H
// Boruch Hashem
// Blessed is He

const Activity = require("./main-connection-activity.js");
const Registration = require("./main-registration-watchdog.js");

/**
 * B"H
 *
 * Socket-open initialization is one recoverable transaction. The Awtsmoos
 * renews observer, receipt, and registration timer; Awtsmoos.com releases every
 * partial vessel and replaces the socket if any required startup boundary fails.
 */
function initializeConnectionOpen(options = {}) {
	const {
		dependencies,
		ws,
		config,
		generation,
		owns,
		terminate
	} = options;
	const activityBinder = options.activityBinder || Activity.bindTransportActivity;
	const registrationStarter = options.registrationStarter ||
		Registration.startRegistrationWatchdog;
	let releaseActivity = () => {};
	let stopWatchdog = () => {};
	let released = false;

	function release() {
		if (released) {
			return;
		}
		released = true;
		releaseActivity();
		stopWatchdog();
	}

	try {
		safeEffect(dependencies, () => dependencies.Control.markSeen?.(ws));
		dependencies.state.wasEverConnected = true;
		dependencies.state.reconnectAttempt = 0;
		safeReceiptWrite(dependencies, "socket_open", {
			tunnelName: config.tunnelName,
			agentVersion: dependencies.agentVersion || "",
			generation
		});
		releaseActivity = activityBinder({
			dependencies,
			generation,
			owns,
			ws
		});
		const watchdog = registrationStarter({
			dependencies,
			ws,
			config,
			generation,
			owns,
			registerReady: dependencies.registerReady,
			onTimeout: () => terminate(
				"registration_ack_timeout",
				null,
				true
			)
		});
		stopWatchdog = watchdog.stop;
		safeLog(dependencies, "info", "B\"H websocket open; registration watchdog armed");
		return {
			ok: true,
			release
		};
	} catch (error) {
		release();
		const reason = `socket_open_initialization_failed:${error?.message || error}`;
		safeLog(dependencies, "warn", reason);
		terminate(reason, "error", true);
		return {
			ok: false,
			release
		};
	}
}

function safeReceiptWrite(dependencies, type, details) {
	safeEffect(dependencies, () => dependencies.Receipt?.write(type, details));
}

function safeEffect(dependencies, effect) {
	try {
		effect();
	} catch (error) {
		safeLog(dependencies, "warn", `Socket-open diagnostic failed: ${error?.message || error}`);
	}
}

function safeLog(dependencies, level, message) {
	try {
		dependencies.log?.(level, message);
	} catch {}
}

module.exports = {
	initializeConnectionOpen
};
