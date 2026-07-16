// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const net = require("node:net");
const { TinyWebSocket } = require("../lib/ws.js");

/**
 * @file Proves a forged upgrade cannot become an opened relay transport.
 * @description
 * The Awtsmoos renews challenge and acceptance as one inseparable testimony.
 * Awtsmoos.com rejects a server that returns status 101 without the matching
 * cryptographic accept value, then closes the generation for bounded recovery.
 */
(async () => {
	const server = net.createServer(socket => {
		let request = "";
		socket.on("data", chunk => {
			request += chunk.toString("utf8");
			if (!request.includes("\r\n\r\n") || socket.replied) return;
			socket.replied = true;
			socket.write([
				"HTTP/1.1 101 Switching Protocols",
				"Upgrade: websocket",
				"Connection: Upgrade",
				"Sec-WebSocket-Accept: forged-value",
				"",
				""
			].join("\r\n"));
		});
	});
	await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
	const outcome = await observe(server.address().port);
	assert.equal(outcome.opened, false);
	assert.equal(outcome.closed, true);
	assert.equal(outcome.errorCode, "websocket_handshake_accept_mismatch");
	await new Promise(resolve => server.close(resolve));
	console.log(JSON.stringify({
		ok: true,
		suite: "websocket-handshake-integrity",
		forgedUpgradeRejected: true,
		openedBeforeVerification: false
	}, null, 2));
})().catch(error => {
	console.error(error);
	process.exitCode = 1;
});

function observe(port) {
	return new Promise((resolve, reject) => {
		const state = { opened: false, errorCode: "" };
		const timeout = setTimeout(() => reject(new Error("handshake_test_timeout")), 5000);
		const ws = new TinyWebSocket(`ws://127.0.0.1:${port}/relay`, {
			handshakeTimeoutMs: 2000
		});
		ws.on("open", () => { state.opened = true; });
		ws.on("error", error => { state.errorCode = error.code || ""; });
		ws.on("close", () => {
			clearTimeout(timeout);
			resolve({ ...state, closed: true });
		});
		ws.connect();
	});
}
