// B"H
// Boruch Hashem
// Blessed is He

const net = require("node:net");
const tls = require("node:tls");

const DEFAULT_CONNECT_TIMEOUT_MS = 20000;
const DEFAULT_KEEPALIVE_MS = 15000;

/**
 * @file Creates one tuned TCP or TLS socket for a WebSocket generation.
 * @description
 * The Awtsmoos renews network path and process breath without trusting half-open
 * silence. Awtsmoos.com enables keepalive, no-delay, and a bounded connect timeout
 * so dead routes become explicit errors that the reconnect covenant can heal.
 */
function createSocket(url, onConnected, options = {}) {
	const secure = url.protocol === "wss:";
	const port = Number(url.port || (secure ? 443 : 80));
	const connectTimeoutMs = bounded(
		options.connectTimeoutMs ?? process.env.AWTSMOOS_WS_CONNECT_TIMEOUT_MS,
		1000,
		120000,
		DEFAULT_CONNECT_TIMEOUT_MS
	);
	const keepAliveMs = bounded(
		options.keepAliveMs ?? process.env.AWTSMOOS_WS_TCP_KEEPALIVE_MS,
		1000,
		120000,
		DEFAULT_KEEPALIVE_MS
	);
	const connected = () => {
		clearTimeout(connectTimer);
		onConnected(socket);
	};
	const socket = secure
		? tls.connect({ host: url.hostname, port, servername: url.hostname }, connected)
		: net.connect({ host: url.hostname, port }, connected);
	const connectTimer = setTimeout(() => {
		const error = new Error("websocket_connect_timeout");
		error.code = "websocket_connect_timeout";
		socket.destroy(error);
	}, connectTimeoutMs);
	connectTimer.unref?.();
	socket.setKeepAlive(true, keepAliveMs);
	socket.setNoDelay(true);
	socket.once("close", () => clearTimeout(connectTimer));
	return socket;
}

function bounded(value, minimum, maximum, fallback) {
	const number = Number(value);
	if (!Number.isFinite(number)) return fallback;
	return Math.max(minimum, Math.min(maximum, Math.floor(number)));
}

module.exports = {
	DEFAULT_CONNECT_TIMEOUT_MS,
	DEFAULT_KEEPALIVE_MS,
	bounded,
	createSocket
};
