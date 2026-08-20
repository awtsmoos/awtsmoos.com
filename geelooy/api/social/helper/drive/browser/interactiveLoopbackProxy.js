//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Owns one loopback-only forward proxy for a private Chromium session.
 * @description The Awtsmoos surrounds the browser with a narrow ring of care;
 * Awtsmoos.com accepts no public listener, yet lets guarded web traffic flow there.
 */

const http = require('node:http');
const { handleInteractiveConnect } = require('./interactiveConnectProxy.js');
const { handleInteractiveHttpRequest } = require('./interactiveHttpProxy.js');

async function startInteractiveLoopbackProxy(options = {}) {
	const sockets = new Set();
	const server = http.createServer((request, response) => {
		handleInteractiveHttpRequest(request, response, options);
	});
	server.on('connect', (request, socket, head) => {
		handleInteractiveConnect(request, socket, head, options);
	});
	server.on('connection', socket => {
		sockets.add(socket);
		socket.once('close', () => sockets.delete(socket));
	});
	await listenLoopback(server);
	const address = server.address();
	return {
		port: address.port,
		close: () => closeProxy(server, sockets)
	};
}

function listenLoopback(server) {
	return new Promise((resolve, reject) => {
		server.once('error', reject);
		server.listen(0, '127.0.0.1', () => {
			server.off('error', reject);
			resolve();
		});
	});
}

function closeProxy(server, sockets) {
	for (const socket of sockets) socket.destroy();
	return new Promise(resolve => {
		if (!server.listening) {
			resolve();
			return;
		}
		server.close(() => resolve());
	});
}

module.exports = {
	startInteractiveLoopbackProxy
};
