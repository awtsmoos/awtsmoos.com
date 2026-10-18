// B"H
// Boruch Hashem
// Blessed is He

const Open = require("./main-connection-open.js");
const Inbound = require("./main-inbound-dispatch.js");
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
	// B"H — durable response playback is reconnect/periodic work, never
	// a side-effect of every inbound request or ACK. The old behavior
	// resent the entire unacknowledged outbox for every packet, creating
	// quadratic response storms under many simultaneous command waits.
	const repeatEveryMs = 2500;
	const setIntervalFn = options.setIntervalFn || setInterval;
	const clearIntervalFn = options.clearIntervalFn || clearInterval;
	let replayTimer = null;

	function releaseObservers() {
		if (replayTimer !== null) clearIntervalFn(replayTimer);
		replayTimer = null;
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
	const inbound = Inbound.createInboundDispatch(deliver);
	const openInitializer = options.openInitializer || Open.initializeConnectionOpen;

	function deliver(raw) {
		if (!owns(ws, generation) || terminal.isTerminal()) return;
		const registeredBefore = dependencies.state.registrationConfirmed === true;
		messages.handle(raw, ws);
		// Replay once on authenticated registration or after reconnect. Do
		// not replay for every accepted read, progress ping or response ACK.
		if (!registeredBefore && dependencies.state.registrationConfirmed === true) {
			ResponseSocket.flush(dependencies, ws);
		}
	}

	ws.on("open", () => {
		if (!owns(ws, generation)) {
			return ws.close(true);
		}
		if (replayTimer === null) {
			replayTimer = setIntervalFn(() => {
				if (!owns(ws, generation) || terminal.isTerminal() ||
					dependencies.state.registrationConfirmed !== true) return;
				const pending = dependencies.TransportMailbox
					? dependencies.TransportMailbox.outbox().length
					: dependencies.state.pendingResponses?.length || 0;
				if (pending > 0) ResponseSocket.flush(dependencies, ws);
			}, repeatEveryMs);
			replayTimer?.unref?.();
		}
		const initialized = openInitializer({
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
		inbound.accept(raw);
	});

	ws.on("close", () => {
		inbound.close();
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
