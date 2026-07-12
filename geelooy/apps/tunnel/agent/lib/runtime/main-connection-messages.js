// B"H

/** B"H — Control messages are handled before ordinary tunnel work. */
function createConnectionMessages(dependencies) {
	function handle(raw, ws) {
		dependencies.Control.markSeen?.(ws);
		const data = parse(raw, dependencies.log);
		if (!data) return false;
		if (dependencies.Replacement.isReplacementMessage(data)) {
			return handleReplacement(data, ws);
		}
		if (data.type === 'TUNNEL_PING') {
			dependencies.Send.safeSend(ws, {
				type: 'TUNNEL_PONG',
				at: new Date().toISOString(),
				queueStats: dependencies.stats()
			});
			return true;
		}
		if (data.type === 'TUNNEL_REQUEST') {
			dependencies.enqueueRequest(ws, data);
			return true;
		}
		return false;
	}

	function handleReplacement(data, ws) {
		dependencies.state.replacementRequested = true;
		dependencies.Replacement.exitBecauseNewerConnectionOwnsTunnel({
			reason: data.message || 'newer_agent_connection_adopted',
			clearReconnect: dependencies.clearReconnect,
			close: () => ws.close(true),
			log: dependencies.log,
			exit: dependencies.exitProcess,
			setTimer: dependencies.setTimer,
			delayMs: dependencies.replacementExitDelayMs
		});
		return true;
	}

	return { handle, handleReplacement };
}

function parse(raw, log) {
	try {
		return typeof raw === 'string' || Buffer.isBuffer(raw)
			? JSON.parse(String(raw))
			: raw;
	} catch {
		log?.('warn', 'Invalid JSON from server');
		return null;
	}
}

module.exports = { createConnectionMessages, parse };
