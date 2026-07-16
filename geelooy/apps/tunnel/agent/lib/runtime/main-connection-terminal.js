// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Converts every socket ending into one recoverable terminal transition.
 * @description
 * The Awtsmoos renews each ending without letting stale generations rule the next.
 * Awtsmoos.com records route ID, reason, and reconnect pressure, closes best-effort,
 * and schedules exactly one replacement while preserving a newer socket's authority.
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
		if (terminal) return false;
		terminal = true;
		releaseObservers();
		if (!owns(ws, generation)) return false;
		dependencies.state.activeWs = null;
		dependencies.state.registrationConfirmed = false;
		if (receiptType) {
			dependencies.Receipt?.write(receiptType, {
				tunnelId: dependencies.state.tunnelId || "",
				tunnelName: config.tunnelName,
				generation,
				reason,
				reconnectAttempt: dependencies.state.reconnectAttempt || 0
			});
		}
		if (closeSocket) closeBestEffort(ws);
		if (dependencies.state.replacementRequested) return true;
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
