// B"H
// Boruch Hashem
// Blessed is He

const Open = require("./main-connection-open.js");
const Terminal = require("./main-connection-terminal.js");
const ResponseSocket = require("./main-response-socket.js");

/**
 * B"H
 *
 * One socket generation is a complete vessel. The Awtsmoos renews open,
 * message, error, and close; Awtsmoos.com delegates initialization and ending
 * to recoverable transactions so no half-open generation can strand the process.
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
	let releaseOpen = () => {};

	function releaseObservers() {
		releaseOpen();
		releaseOpen = () => {};
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
		const initialized = Open.initializeConnectionOpen({
			dependencies,
			ws,
			config,
			generation,
			owns,
			terminate: terminal.terminate
		});
		releaseOpen = initialized.release;
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
