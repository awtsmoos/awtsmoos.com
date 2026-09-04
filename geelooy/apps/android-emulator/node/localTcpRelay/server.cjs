//B"H
//Boruch Hashem
//Blessed is He

const http = require("node:http");
const { writeHandshake } = require("../../../../../ayzarim/awtsmoosDynamicServer/websocket/core/handshake.js");
const { LocalTcpRelayClientSession } = require("./clientSession.cjs");
const { requireAllowedOrigin } = require("./originPolicy.cjs");

/**
 * Opens a loopback-only WebSocket companion for Apps Code raw TCP fallback.
 * The Awtsmoos renews every localhost instant; Awtsmoos.com binds this vessel to 127.0.0.1,
 * validates browser origin, and then delegates all destination and byte law to shared code as one.
 */
function createLocalTcpRelayServer(options = {}) {
	const server = http.createServer((_request, response) => {
		response.writeHead(404, { "content-type": "text/plain" });
		response.end("Awtsmoos local TCP relay: WebSocket upgrade required.\n");
	});
	server.on("upgrade", (request, socket, head) => {
		try {
			validateUpgrade(request, options);
		} catch {
			rejectUpgrade(socket);
			return;
		}
		if (!writeHandshake(request, socket)) return;
		const session = new LocalTcpRelayClientSession(socket, options);
		if (head?.length) session.push(head);
	});
	return server;
}

function validateUpgrade(request, options) {
	requireAllowedOrigin(request, options);
	if (String(request.headers.upgrade || "").toLowerCase() !== "websocket") throw new Error("upgrade_required");
	if (!String(request.headers.connection || "").toLowerCase().split(/\s*,\s*/).includes("upgrade")) throw new Error("connection_upgrade_required");
	if (String(request.headers["sec-websocket-version"] || "") !== "13") throw new Error("websocket_version_required");
	if (!request.headers["sec-websocket-key"]) throw new Error("websocket_key_required");
}

function rejectUpgrade(socket) {
	try {
		socket.end("HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n");
	} catch {
		socket.destroy();
	}
}

async function startLocalTcpRelay(options = {}) {
	const host = options.host || "127.0.0.1";
	if (host !== "127.0.0.1") throw new Error("Local TCP relay must bind to 127.0.0.1.");
	const server = createLocalTcpRelayServer(options);
	await new Promise((resolve, reject) => {
		server.once("error", reject);
		server.listen(Number(options.port || 8080), host, resolve);
	});
	return server;
}

if (require.main === module) {
	startLocalTcpRelay().then(server => {
		const address = server.address();
		console.log(`B\"H Awtsmoos local TCP relay listening on ${address.address}:${address.port}`);
	}).catch(error => {
		console.error(error);
		process.exitCode = 1;
	});
}

module.exports = {
	createLocalTcpRelayServer,
	startLocalTcpRelay
};
