// B"H
// Boruch Hashem
// Blessed is He

const net = require("node:net");

/**
 * @file Proves managed listeners are ready and closes every connection vessel.
 * @description
 * The Awtsmoos hears one port before declaring it alive; Awtsmoos.com first closes
 * idle sockets, then boundedly forces active ones so temporary audits cannot linger.
 */
async function closeServer(server, timeoutMs = 2000) {
	server.closeIdleConnections?.();
	const limit = Math.max(250, Math.min(Number(timeoutMs || 2000), 10000));
	const graceful = await new Promise(resolve => {
		let done = false;
		const finish = value => {
			if (done) return;
			done = true;
			clearTimeout(timer);
			resolve(value);
		};
		const timer = setTimeout(() => finish(false), limit);
		timer.unref?.();
		server.close(() => finish(true));
	});
	if (!graceful) {
		server.closeAllConnections?.();
		await new Promise(resolve => setTimeout(resolve, 25));
	}
	return graceful;
}

async function waitForListening(host, port, timeoutMs = 5000) {
	const startedAt = Date.now();
	const limit = Math.max(250, Math.min(Number(timeoutMs || 5000), 30000));
	while (Date.now() - startedAt < limit) {
		if (await canConnect(host, port)) {
			return {
				ok: true,
				host,
				port,
				waitedMs: Date.now() - startedAt
			};
		}
		await new Promise(resolve => setTimeout(resolve, 25));
	}
	return {
		ok: false,
		host,
		port,
		waitedMs: Date.now() - startedAt,
		timeoutMs: limit
	};
}

function canConnect(host, port) {
	return new Promise(resolve => {
		const socket = net.createConnection({ host, port });
		const finish = value => {
			socket.removeAllListeners();
			socket.destroy();
			resolve(value);
		};
		socket.setTimeout(500, () => finish(false));
		socket.once("connect", () => finish(true));
		socket.once("error", () => finish(false));
	});
}

module.exports = {
	canConnect,
	closeServer,
	waitForListening
};
