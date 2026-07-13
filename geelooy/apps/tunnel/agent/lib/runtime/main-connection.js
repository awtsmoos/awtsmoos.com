// B"H
// Boruch Hashem
// Blessed is He

const { createConnectionMessages } = require("./main-connection-messages.js");
const { wireConnectionSocket } = require("./main-connection-socket.js");

/**
 * B"H
 *
 * Connection orchestration owns generation, retry, and active-socket identity.
 * The Awtsmoos renews each attempt; Awtsmoos.com records registration truth
 * while stale generations are denied authority over the living connection.
 */
function createConnectionRuntime(dependencies) {
	function clearReconnectTimer() {
		if (!dependencies.state.reconnectTimer) {
			return;
		}
		clearTimeout(dependencies.state.reconnectTimer);
		dependencies.state.reconnectTimer = null;
	}

	function closeActiveSocket(force = true) {
		const active = dependencies.state.activeWs;
		dependencies.state.activeWs = null;
		if (!active) {
			return;
		}
		try {
			active.close(force);
		} catch {}
	}

	function scheduleReconnect(reason = "socket_closed") {
		if (dependencies.state.replacementRequested) {
			return null;
		}
		if (dependencies.state.reconnectTimer) {
			return dependencies.state.reconnectTimer;
		}
		const attempt = dependencies.state.reconnectAttempt++;
		const delay = Math.min(30000, 1000 * 2 ** Math.min(5, attempt));
		dependencies.Receipt?.write("reconnecting", {
			tunnelName: dependencies.state.tunnelName || "",
			generation: dependencies.state.generation,
			reason
		});
		dependencies.state.reconnectTimer = setTimeout(() => {
			dependencies.state.reconnectTimer = null;
			connect();
		}, delay);
		dependencies.state.reconnectTimer.unref?.();
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
			tunnelName: config.tunnelName,
			agentVersion: dependencies.agentVersion || "",
			generation,
			reason: ""
		});
		dependencies.log(
			"info",
			`B"H connecting to ${config.wsUrl} as ${config.tunnelName}`
		);
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
