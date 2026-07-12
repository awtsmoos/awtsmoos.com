// B"H
const { createConnectionMessages } = require('./main-connection-messages.js');

/**
 * B"H — Connection generations prevent an old socket from reclaiming the
 * doorway, while replacement messages end the older process without reconnect.
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
		try { active.close(force); } catch (_) {}
	}

	function scheduleReconnect() {
		if (dependencies.state.replacementRequested) return null;
		if (dependencies.state.reconnectTimer) return dependencies.state.reconnectTimer;
		const attempt = dependencies.state.reconnectAttempt++;
		const delay = Math.min(30000, 1000 * 2 ** Math.min(5, attempt));
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
		dependencies.state.replacementRequested = false;
		closeActiveSocket(true);
		dependencies.log('info', `B"H connecting to ${config.wsUrl} as ${config.tunnelName}`);
		const ws = new dependencies.TinyWebSocket(config.wsUrl);
		dependencies.state.activeWs = ws;
		const messages = createConnectionMessages({
			...dependencies,
			clearReconnect: clearReconnectTimer
		});
		wireSocket(ws, config, generation, messages);
		ws.connect();
		return ws;
	}

	function wireSocket(ws, config, generation, messages) {
		ws.on('open', () => {
			if (!owns(ws, generation)) return ws.close(true);
			dependencies.Control.markSeen?.(ws);
			dependencies.state.wasEverConnected = true;
			dependencies.state.reconnectAttempt = 0;
			dependencies.log('info', 'B"H websocket open');
			dependencies.registerReady(ws, config);
		});
		ws.on('message', raw => {
			if (owns(ws, generation)) messages.handle(raw, ws);
		});
		ws.on('close', () => {
			if (!owns(ws, generation)) return;
			dependencies.state.activeWs = null;
			if (dependencies.state.replacementRequested) return;
			dependencies.log('warn', 'WS closed; reconnecting...');
			scheduleReconnect();
		});
		ws.on('error', error => {
			if (owns(ws, generation)) dependencies.log('warn', `WS error: ${error.message}`);
		});
	}

	function owns(ws, generation) {
		return dependencies.state.activeWs === ws && dependencies.state.generation === generation;
	}

	return { clearReconnectTimer, closeActiveSocket, connect, scheduleReconnect };
}

module.exports = { createConnectionRuntime };
