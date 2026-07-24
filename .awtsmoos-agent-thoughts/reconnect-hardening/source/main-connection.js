// B"H
// Boruch Hashem
// Blessed is He

const { createConnectionMessages } = require("./main-connection-messages.js");
const Reconnect = require("./main-reconnect-policy.js");
const { wireConnectionSocket } = require("./main-connection-socket.js");

/**
 * @file Owns socket generations and an immortal reconnect covenant.
 * @description
 * The Awtsmoos renews every failed path without letting a dead socket become king.
 * Awtsmoos.com keeps the reconnect timer referenced, backs off across generations,
 * and resets only after accepted registration rather than a merely opened transport.
 */
function createConnectionRuntime(dependencies) {
	function clearReconnectTimer() {
		if (!dependencies.state.reconnectTimer) return;
		clearTimeout(dependencies.state.reconnectTimer);
		dependencies.state.reconnectTimer = null;
	}

	function closeActiveSocket(force = true) {
		const active = dependencies.state.activeWs;
		dependencies.state.activeWs = null;
		if (!active) return;
		try {
			active.close(force);
		} catch {}
	}

	function scheduleReconnect(reason = "socket_closed") {
		if (dependencies.state.replacementRequested) return null;
		if (dependencies.state.reconnectTimer) {
			return dependencies.state.reconnectTimer;
		}
		const attempt = Reconnect.nextAttempt(dependencies.state);
		const delay = Reconnect.delayForAttempt(attempt, {
			random: dependencies.random
		});
		dependencies.Receipt?.write("reconnecting", {
			tunnelId: dependencies.state.tunnelId || "",
			tunnelName: dependencies.state.tunnelName || "",
			generation: dependencies.state.generation,
			reason,
			reconnectAttempt: attempt + 1,
			reconnectDelayMs: delay
		});
		dependencies.state.reconnectTimer = setTimeout(() => {
			dependencies.state.reconnectTimer = null;
			connect();
		}, delay);
		return dependencies.state.reconnectTimer;
	}

	function connect() {
		const config = dependencies.loadConfig();
		const generation = dependencies.state.generation + 1;
		dependencies.state.generation = generation;
		dependencies.state.tunnelName = config.tunnelName;
		dependencies.state.registrationConfirmed = false;
		dependencies.state.registrationRejected = false;
		dependencies.state.registrationFailureReason = "";
		dependencies.state.replacementRequested = false;
		closeActiveSocket(true);
		dependencies.Receipt?.write("connecting", {
			tunnelId: dependencies.state.tunnelId || "",
			tunnelName: config.tunnelName,
			agentVersion: dependencies.agentVersion || "",
			generation,
			reason: ""
		});
		dependencies.log("info", `B"H connecting to ${config.wsUrl} as ${config.tunnelName}`);
		const ws = new dependencies.TinyWebSocket(config.wsUrl);
		dependencies.state.activeWs = ws;
		const messages = createConnectionMessages({
			...dependencies,
			clearReconnect: clearReconnectTimer
		});
		wireConnectionSocket({
			dependencies,
			ws,
			config,
			generation,
			messages,
			owns,
			scheduleReconnect
		});
		ws.connect();
		return ws;
	}

	function owns(ws, generation) {
		return dependencies.state.activeWs === ws &&
			dependencies.state.generation === generation;
	}

	return {
		clearReconnectTimer,
		closeActiveSocket,
		connect,
		scheduleReconnect
	};
}

module.exports = {
	createConnectionRuntime
};
