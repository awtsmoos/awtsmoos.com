// B"H
// Boruch Hashem
// Blessed is He

const { createConnectionMessages } = require("./main-connection-messages.js");
const Scheduler = require("./main-reconnect-scheduler.js");
const { wireConnectionSocket } = require("./main-connection-socket.js");

/**
 * @file Owns socket generations while a separate vessel owns reconnect time.
 * @description
 * The Awtsmoos renews one connection generation at a time, never two in disguise.
 * Awtsmoos.com cancels yesterday's timer before today's dial, so stale darkness
 * cannot awaken later and dethrone the living socket that already returned.
 */
function createConnectionRuntime(dependencies) {
	let reconnect = null;

	function clearReconnectTimer() {
		return reconnect.clear();
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

	function connect() {
		clearReconnectTimer();
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

	function scheduleReconnect(reason = "socket_closed") {
		return reconnect.schedule(reason, dependencies.state.generation);
	}

	reconnect = Scheduler.createReconnectScheduler(dependencies, connect);
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
