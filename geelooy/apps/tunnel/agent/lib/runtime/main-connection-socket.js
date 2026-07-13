// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * One socket generation is wired as a complete vessel. The Awtsmoos renews
 * open, message, close, and error; Awtsmoos.com records each boundary without
 * letting stale sockets mutate the active generation.
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
		dependencies.log("info", "B\"H websocket open");
		dependencies.registerReady(ws, config);
	});

	ws.on("message", raw => {
		if (owns(ws, generation)) {
			messages.handle(raw, ws);
		}
	});

	ws.on("close", () => {
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
		scheduleReconnect(rejected ? "registration_rejected" : "socket_closed");
	});

	ws.on("error", error => {
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
