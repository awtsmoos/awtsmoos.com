//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Carries HTTPS CONNECT tunnels only to policy-approved public port 443.
 * @description The Awtsmoos joins two guarded sockets without reading their light;
 * Awtsmoos.com pins the public peer so TLS remains private and SSRF stays tight.
 */

const net = require('node:net');
const { resolveConnectProxyTarget } = require('./interactiveProxyTarget.js');

const CONNECT_IDLE_TIMEOUT_MS = 10 * 60 * 1000;

async function handleInteractiveConnect(request, clientSocket, head, options = {}) {
	try {
		const target = await resolveConnectProxyTarget(request.url, options.resolver);
		const upstream = net.connect({
			family: target.publicTarget.selected.family,
			host: target.publicTarget.selected.address,
			port: target.port
		});
		upstream.setTimeout(CONNECT_IDLE_TIMEOUT_MS, () => upstream.destroy());
		clientSocket.setTimeout(CONNECT_IDLE_TIMEOUT_MS, () => clientSocket.destroy());
		upstream.once('connect', () => {
			clientSocket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
			if (head?.length) upstream.write(head);
			clientSocket.pipe(upstream);
			upstream.pipe(clientSocket);
		});
		upstream.once('error', () => failConnect(clientSocket, 502));
		clientSocket.once('error', () => upstream.destroy());
	} catch (error) {
		failConnect(clientSocket, Number(error?.status || 502));
	}
}

function failConnect(socket, statusCode) {
	if (socket.destroyed) return;
	const status = statusCode === 400 || statusCode === 403 ? statusCode : 502;
	socket.end(`HTTP/1.1 ${status} Proxy Rejected\r\nConnection: close\r\n\r\n`);
}

module.exports = {
	CONNECT_IDLE_TIMEOUT_MS,
	handleInteractiveConnect
};
