// B"H
// Boruch Hashem
// Blessed is He

const Activity = require("./main-connection-activity.js");
const Registration = require("./main-registration-watchdog.js");
const ResponseSocket = require("./main-response-socket.js");

/**
 * B"H
 *
 * One socket generation is a complete vessel. The Awtsmoos renews transport,
 * registration, close, and error; Awtsmoos.com retries acknowledgement locally
 * and releases completed work when the registered doorway returns.
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

	function releaseConnectionObservers() {
		releaseTransportActivity();
		stopRegistrationWatchdog();
		releaseTransportActivity = () => {};
		stopRegistrationWatchdog = () => {};
	}

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
			registerReady: dependencies.registerReady
		});
		stopRegistrationWatchdog = registration.stop;
		dependencies.log("info", "B\"H websocket open");
	});

	ws.on("message", raw => {
		if (!owns(ws, generation)) {
			return;
		}
		messages.handle(raw, ws);
		if (dependencies.state.registrationConfirmed === true) {
			ResponseSocket.flush(dependencies, ws);
		}
	});

	ws.on("close", () => {
		releaseConnectionObservers();
		if (!owns(ws, generation)) {
			return;
		}
		dependencies.state.activeWs = null;
		if (dependencies.state.replacementRequested) {
			return;
		}
		dependencies.state.registrationConfirmed = false;
		const rejected = dependencies.state.registrationRejected === true;
		dependencies.Receipt?.write(
			rejected ? "registration_rejected" : "closed",
			{
				tunnelName: config.tunnelName,
				generation,
				reason: rejected
					? dependencies.state.registrationFailureReason
					: "socket_closed"
			}
		);
		dependencies.log("warn", "WS closed; reconnecting...");
		scheduleReconnect(
			rejected ? "registration_rejected" : "socket_closed"
		);
	});

	ws.on("error", error => {
		releaseConnectionObservers();
		if (!owns(ws, generation)) {
			return;
		}
		dependencies.Receipt?.write("error", {
			tunnelName: config.tunnelName,
			generation,
			reason: error.message
		});
		dependencies.log("warn", `WS error: ${error.message}`);
	});
}

module.exports = {
	wireConnectionSocket
};
