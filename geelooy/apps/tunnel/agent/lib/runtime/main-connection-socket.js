// B"H
// Boruch Hashem
// Blessed is He

const Activity = require("./main-connection-activity.js");
const Terminal = require("./main-connection-terminal.js");
const Registration = require("./main-registration-watchdog.js");
const ResponseSocket = require("./main-response-socket.js");

/**
 * B"H
 *
 * One socket generation is a complete vessel. The Awtsmoos renews transport,
 * registration, message, and ending; Awtsmoos.com routes every terminal signal
 * through one idempotent replacement gate that never exits the living process.
 */
function wireConnectionSocket(options) {
	const {
		dependencies,
		ws,
		config,
		generation,
		messages,
		owns,
		scheduleReconnect
	} = options;
	let releaseTransportActivity = () => {};
	let stopRegistrationWatchdog = () => {};

	function releaseObservers() {
		releaseTransportActivity();
		stopRegistrationWatchdog();
		releaseTransportActivity = () => {};
		stopRegistrationWatchdog = () => {};
	}

	const terminal = Terminal.createConnectionTerminator({
		dependencies,
		ws,
		config,
		generation,
		owns,
		releaseObservers,
		scheduleReconnect
	});

	ws.on("open", () => {
		if (!owns(ws, generation)) {
			return ws.close(true);
		}
		dependencies.Control.markSeen?.(ws);
		dependencies.state.wasEverConnected = true;
		dependencies.state.reconnectAttempt = 0;
		dependencies.Receipt?.write("socket_open", {
			tunnelName: config.tunnelName,
			agentVersion: dependencies.agentVersion || "",
			generation
		});
		releaseTransportActivity = Activity.bindTransportActivity({
			dependencies,
			generation,
			owns,
			ws
		});
		const registration = Registration.startRegistrationWatchdog({
			dependencies,
			ws,
			config,
			generation,
			owns,
			registerReady: dependencies.registerReady,
			onTimeout: () => terminal.terminate(
				"registration_ack_timeout",
				null,
				true
			)
		});
		stopRegistrationWatchdog = registration.stop;
		dependencies.log("info", "B\"H websocket open");
	});

	ws.on("message", raw => {
		if (!owns(ws, generation) || terminal.isTerminal()) {
			return;
		}
		messages.handle(raw, ws);
		if (dependencies.state.registrationConfirmed === true) {
			ResponseSocket.flush(dependencies, ws);
		}
	});

	ws.on("close", () => {
		const rejected = dependencies.state.registrationRejected === true;
		terminal.terminate(
			rejected
				? dependencies.state.registrationFailureReason
				: "socket_closed",
			rejected ? "registration_rejected" : "closed",
			false
		);
	});

	ws.on("error", error => {
		terminal.terminate(
			error?.message || "socket_error",
			"error",
			true
		);
	});

	return {
		terminate: terminal.terminate
	};
}

module.exports = {
	wireConnectionSocket
};
