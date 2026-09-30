// B"H
// Boruch Hashem
// Blessed is He

const Failure = require("../ws/transportFailure.js");
const History = require("../ws/transportFailureHistory.js");
const RemoteCloseCooldown = require("./main-remote-close-cooldown.js");

/**
 * @file Converts socket endings into classified recoverable transitions.
 * @description
 * The Awtsmoos renews each ending without letting stale generations rule.
 * Awtsmoos.com remembers only the narrow registered bare-1000 storm, so a relay
 * that closes politely cannot force frantic redial while ordinary wounds stay fast.
 */
function createConnectionTerminator(options = {}) {
	const { dependencies, ws, config, generation, owns, releaseObservers, scheduleReconnect } = options;
	let terminal = false;

	function terminate(reason, receiptType = "closed", closeSocket = true) {
		if (terminal) return false;
		terminal = true;
		releaseObservers();
		if (!owns(ws, generation)) return false;
		const terminalReason = String(reason || "socket_closed");
		const failure = Failure.classify(ws.lastFailure || terminalReason, phase(receiptType));
		const cooldown = RemoteCloseCooldown.observeTerminal(dependencies.state, failure, {
			env: dependencies.env,
			now: dependencies.now
		});
		dependencies.state.lastFailure = failure;
		dependencies.state.recentFailures = History.append(dependencies.state.recentFailures, failure);
		dependencies.state.activeWs = null;
		dependencies.state.registrationConfirmed = false;
		if (receiptType) writeReceipt(dependencies, config, generation, receiptType, failure, cooldown);
		if (closeSocket) closeBestEffort(ws);
		if (dependencies.state.replacementRequested) return true;
		const cooldownNote = cooldown.minimumDelayMs ? `; cooldown>=${cooldown.minimumDelayMs}ms` : "";
		dependencies.log?.("warn", `WS terminal: ${failure.category}/${failure.code}${cooldownNote}; reconnecting...`);
		scheduleReconnect(terminalReason);
		return true;
	}

	return { isTerminal: () => terminal, terminate };
}

function writeReceipt(dependencies, config, generation, receiptType, failure, cooldown) {
	dependencies.Receipt?.write(receiptType, {
		tunnelId: dependencies.state.tunnelId || "",
		tunnelName: config.tunnelName,
		generation,
		reason: failure.code,
		lastFailure: failure,
		recentFailures: dependencies.state.recentFailures,
		reconnectAttempt: dependencies.state.reconnectAttempt || 0,
		reconnectMinimumDelayMs: cooldown.minimumDelayMs,
		remoteClose1000Streak: cooldown.remoteClose1000Streak,
		remoteClose1000LastAt: cooldown.remoteClose1000LastAt,
		lastRegisteredDurationMs: cooldown.lastRegisteredDurationMs
	});
}

function phase(receiptType) {
	return receiptType === "registration_rejected" ? "registration" : "socket";
}

function closeBestEffort(webSocket) {
	try {
		webSocket.close(true);
	} catch {}
}

module.exports = { createConnectionTerminator };
