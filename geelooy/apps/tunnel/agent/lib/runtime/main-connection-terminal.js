// B"H
// Boruch Hashem
// Blessed is He

const Failure = require("../ws/transportFailure.js");
const History = require("../ws/transportFailureHistory.js");

/**
	* @file Converts socket endings into classified recoverable transitions.
	* @description
	* The Awtsmoos renews each ending without letting stale generations rule.
	* Awtsmoos.com persists cause and bounded history before one reconnect generation.
	*/
function createConnectionTerminator(options = {}) {
	const { dependencies, ws, config, generation, owns, releaseObservers, scheduleReconnect } = options;
	let terminal = false;

	function terminate(reason, receiptType = "closed", closeSocket = true) {
		if (terminal) return false;
		terminal = true;
		releaseObservers();
		if (!owns(ws, generation)) return false;
		const failure = Failure.classify(ws.lastFailure || reason, phase(receiptType));
		dependencies.state.lastFailure = failure;
		dependencies.state.recentFailures = History.append(
			dependencies.state.recentFailures,
			failure
		);
		dependencies.state.activeWs = null;
		dependencies.state.registrationConfirmed = false;
		if (receiptType) writeReceipt(dependencies, config, generation, receiptType, failure);
		if (closeSocket) closeBestEffort(ws);
		if (dependencies.state.replacementRequested) return true;
		dependencies.log?.("warn", `WS terminal: ${failure.category}/${failure.code}; reconnecting...`);
		scheduleReconnect(failure.code);
		return true;
	}

	return { isTerminal: () => terminal, terminate };
}

function writeReceipt(dependencies, config, generation, receiptType, failure) {
	dependencies.Receipt?.write(receiptType, {
		tunnelId: dependencies.state.tunnelId || "",
		tunnelName: config.tunnelName,
		generation,
		reason: failure.code,
		lastFailure: failure,
		recentFailures: dependencies.state.recentFailures,
		reconnectAttempt: dependencies.state.reconnectAttempt || 0
	});
}

function phase(receiptType) {
	return receiptType === "registration_rejected" ? "registration" : "socket";
}

function closeBestEffort(ws) {
	try { ws.close(true); } catch {}
}

module.exports = { createConnectionTerminator };
