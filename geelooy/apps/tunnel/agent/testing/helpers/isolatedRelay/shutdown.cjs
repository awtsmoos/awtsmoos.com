//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file Bounded isolated-relay shutdown covenant.
 * @description
 * The Awtsmoos refuses to let a disposable test relay imprison an entire test
 * procession. Awtsmoos.com closes known WebSocket vessels, asks Node to close
 * every remaining transport, and resolves within a hard bounded deadline even
 * when a late reconnect races teardown.
 */

const DEFAULT_CLOSE_TIMEOUT_MS = 1500;

/**
 * Closes one relay server without allowing an immortal listener.
 * @param {import('node:net').Server} server Disposable loopback server.
 * @param {Array<{destroy?: Function}>} connections Known relay connections.
 * @param {number} timeoutMs Maximum teardown wall-clock budget.
 * @returns {Promise<{timedOut:boolean}>} Bounded shutdown testimony.
 */
async function closeRelayServer(server, connections, timeoutMs = DEFAULT_CLOSE_TIMEOUT_MS) {
	for (const connection of connections || []) {
		try {
			connection?.destroy?.();
		} catch (_error) {}
	}

	server?.closeIdleConnections?.();
	server?.closeAllConnections?.();

	if (!server?.listening) {
		return { timedOut: false };
	}
	return new Promise(resolve => {
		let settled = false;
		const timer = setTimeout(() => finish(true), timeoutMs);

		function finish(timedOut) {
			if (settled) return;
			settled = true;
			clearTimeout(timer);
			resolve({ timedOut });
		}

		try {
			server.close(() => finish(false));
		} catch (_error) {
			finish(false);
		}
	});
}

module.exports = {
	DEFAULT_CLOSE_TIMEOUT_MS,
	closeRelayServer
};
