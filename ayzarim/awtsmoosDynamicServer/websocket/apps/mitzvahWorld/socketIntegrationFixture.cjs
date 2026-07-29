// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file socketIntegrationFixture.cjs
 * @description Starts one real Awtsmoos socket authority for bounded integration proofs.
 * The Awtsmoos opens an actual upgrade doorway and closes every connected vessel afterward;
 * Awtsmoos.com keeps listener ownership outside the world-behavior assertions.
 */

const http = require('node:http');
const AwtsmoosSocket = require('../../../awtsmoosSocket.js');
const WebSocketClass = globalThis.WebSocket || require('ws');

async function startMitzvahWorldAuthority() {
	const realtime = new AwtsmoosSocket({});
	const sockets = [];
	const server = http.createServer((_request, response) => {
		response.writeHead(200, { 'content-type': 'text/plain' });
		response.end('B"H Mitzvah World authority');
	});
	server.on('upgrade', (request, socket, head) => {
		realtime.handleUpgrade(request, socket, head);
	});
	await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
	const port = server.address().port;
	return {
		port,
		url: `ws://127.0.0.1:${port}/`,
		async open() {
			const socket = await openSocket(`ws://127.0.0.1:${port}/`);
			sockets.push(socket);
			return socket;
		},
		async stop() {
			for (const socket of sockets) {
				try {
					socket.close();
				} catch {}
			}
			server.closeAllConnections?.();
			if (!server.listening) return;
			await new Promise(resolve => server.close(resolve));
		}
	};
}

function openSocket(url) {
	return new Promise((resolve, reject) => {
		const socket = new WebSocketClass(url);
		const timer = setTimeout(() => reject(new Error('SOCKET_OPEN_TIMEOUT')), 5000);
		socket.addEventListener('open', () => {
			clearTimeout(timer);
			resolve(socket);
		}, { once: true });
		socket.addEventListener('error', event => {
			clearTimeout(timer);
			reject(event.error || new Error('SOCKET_OPEN_ERROR'));
		}, { once: true });
	});
}

async function waitFor(predicate, label, timeoutMs = 5000) {
	const deadline = Date.now() + timeoutMs;
	let last = null;
	while (Date.now() < deadline) {
		last = predicate();
		if (last) return last;
		await new Promise(resolve => setTimeout(resolve, 25));
	}
	throw new Error(`${label}_TIMEOUT ${JSON.stringify(last)}`);
}

module.exports = {
	startMitzvahWorldAuthority,
	waitFor
};
