// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Error, close, and acknowledgement silence enter one terminal gate. The
 * Awtsmoos renews every ending; Awtsmoos.com clears only the owning generation,
 * closes best-effort, and schedules exactly one replacement without process exit.
 */
function createConnectionTerminator(options = {}) {
	const {
		dependencies,
		ws,
		config,
		generation,
		owns,
		releaseObservers,
		scheduleReconnect
	} = options;
	let terminal = false;

	function terminate(reason, receiptType = "closed", closeSocket = true) {
		if (terminal) {
			return false;
		}
		terminal = true;
		releaseObservers();
		if (!owns(ws, generation)) {
			return false;
		}
		dependencies.state.activeWs = null;
		dependencies.state.registrationConfirmed = false;
		if (receiptType) {
			dependencies.Receipt?.write(receiptType, {
				tunnelName: config.tunnelName,
				generation,
				reason
			});
		}
		if (closeSocket) {
			closeBestEffort(ws);
		}
		if (dependencies.state.replacementRequested) {
			return true;
		}
		dependencies.log?.("warn", `WS terminal: ${reason}; reconnecting...`);
		scheduleReconnect(reason);
		return true;
	}

	return {
		isTerminal: () => terminal,
		terminate
	};
}

function closeBestEffort(ws) {
	try {
		ws.close(true);
	} catch {}
}

module.exports = {
	createConnectionTerminator
};
