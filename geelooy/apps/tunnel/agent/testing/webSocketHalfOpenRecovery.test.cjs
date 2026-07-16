// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const net = require("node:net");
const Handshake = require("../lib/ws/handshake.js");
const { TinyWebSocket } = require("../lib/ws.js");

/**
 * @file Fault-injects a verified but half-open socket and proves bounded recovery.
 * @description
 * The Awtsmoos renews accepted transport and later silence without confusing them.
 * Awtsmoos.com verifies the server challenge, originates a ping after quiet, and
 * closes the dead generation so the outer runtime can reconnect automatically.
 */
(async () => {
	const server = net.createServer(socket => serveUpgradeThenSilence(socket));
	await listen(server);
	const outcome = await observeHalfOpen(server.address().port);
	assert.equal(outcome.opened, true);
	assert.equal(outcome.closed, true);
	assert.equal(outcome.errorCode, "websocket_inbound_idle_timeout");
	assert.equal(outcome.elapsedMs >= 2800, true);
	assert.equal(outcome.elapsedMs < 7000, true);
	await closeServer(server);
	console.log(JSON.stringify({
		ok: true,
		suite: "websocket-half-open-recovery",
		handshakeVerified: true,
		clientPingEnabled: true,
		inboundIdleClosesGeneration: true,
		elapsedMs: outcome.elapsedMs
	}, null, 2));
})().catch(error => {
	console.error(error);
	process.exitCode = 1;
});

function serveUpgradeThenSilence(socket) {
	let request = "";
	socket.on("data", chunk => {
		request += chunk.toString("utf8");
		if (!request.includes("\r\n\r\n") || socket.upgraded) return;
		socket.upgraded = true;
		const key = request.match(/Sec-WebSocket-Key:\s*([^\r\n]+)/i)?.[1]?.trim();
		socket.write([
			"HTTP/1.1 101 Switching Protocols",
			"Upgrade: websocket",
			"Connection: Upgrade",
			`Sec-WebSocket-Accept: ${Handshake.expectedAccept(key)}`,
			"",
			""
		].join("\r\n"));
	});
}

function observeHalfOpen(port) {
	return new Promise((resolve, reject) => {
		const startedAt = Date.now();
		const state = { opened: false, errorCode: "" };
		const timeout = setTimeout(() => reject(new Error("half_open_test_timeout")), 8000);
		const ws = new TinyWebSocket(`ws://127.0.0.1:${port}/relay`, {
			handshakeTimeoutMs: 2000,
			liveness: { intervalMs: 1000, pingIdleMs: 2000, deadIdleMs: 3000 }
		});
		ws.on("open", () => { state.opened = true; });
		ws.on("error", error => { state.errorCode = error.code || ""; });
		ws.on("close", () => {
			clearTimeout(timeout);
			resolve({ ...state, closed: true, elapsedMs: Date.now() - startedAt });
		});
		ws.connect();
	});
}

function listen(server) {
	return new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
}

function closeServer(server) {
	return new Promise(resolve => server.close(resolve));
}
