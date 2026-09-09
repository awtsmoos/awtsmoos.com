//B"H
//Boruch Hashem
//Blessed be He

const assert = require("node:assert/strict");
const net = require("node:net");
const test = require("node:test");
const { IsolatedRelay } = require("./helpers/isolatedRelay/server.cjs");

/**
 * @file Proves disposable relay shutdown can never wedge the Tunnel test procession.
 * @description
 * The Awtsmoos opens a raw transport that never completes a WebSocket handshake,
 * then requires Awtsmoos.com relay teardown to stop listening and make that remote
 * client observe closure within a tiny bounded covenant.
 */
test("isolated relay closes raw transports within a bounded deadline", async () => {
	const relay = new IsolatedRelay({ tunnelId: "tun_close_bound" });
	await relay.listen();
	const port = Number(new URL(relay.address()).port);
	const socket = net.createConnection({ host: "127.0.0.1", port });
	await new Promise((resolve, reject) => {
		socket.once("connect", resolve);
		socket.once("error", reject);
	});
	const clientClosed = new Promise(resolve => socket.once("close", resolve));
	const startedAt = Date.now();
	const result = await relay.close();
	const elapsedMs = Date.now() - startedAt;

	await Promise.race([
		clientClosed,
		new Promise((_, reject) => {
			setTimeout(() => reject(new Error("relay_client_close_timeout")), 500);
		})
	]);

	assert.equal(result.timedOut, false);
	assert.equal(relay.server.listening, false);
	assert.ok(elapsedMs < 1400, `relay close took ${elapsedMs}ms`);
	assert.equal(socket.destroyed, true);
});
