//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import { createRequire } from "node:module";
import net from "node:net";
import test from "node:test";

const require = createRequire(import.meta.url);
const { requireAllowedOrigin } = require("../node/localTcpRelay/originPolicy.cjs");
const { createLocalTcpRelaySession } = require("../node/localTcpRelay/tcpSession.cjs");
const { startLocalTcpRelay } = require("../node/localTcpRelay/server.cjs");

function waitFor(predicate, timeoutMs = 1500) {
	return new Promise((resolve, reject) => {
		const started = Date.now();
		const timer = setInterval(() => {
			if (predicate()) {
				clearInterval(timer);
				resolve();
				return;
			}
			if (Date.now() - started > timeoutMs) {
				clearInterval(timer);
				reject(new Error("wait timeout"));
			}
		}, 5);
	});
}

/**
 * Proves the local vessel retains Awtsmoos.com origin/bind discipline and then moves real TCP bytes.
 * Test-only resolution points at loopback; production resolution remains the hardened public-only law.
 */
test("local relay rejects arbitrary origins and non-loopback bind", async () => {
	assert.throws(
		() => requireAllowedOrigin({ headers: { origin: "https://evil.example" } }),
		/origin_forbidden/
	);
	await assert.rejects(
		() => startLocalTcpRelay({ host: "0.0.0.0", port: 0 }),
		/127\.0\.0\.1/
	);
});

test("shared relay session carries exact bytes through a real TCP socket", async () => {
	const echo = net.createServer(socket => {
		socket.pipe(socket);
	});
	await new Promise(resolve => {
		echo.listen(0, "127.0.0.1", resolve);
	});
	let session = null;
	try {
		const port = echo.address().port;
		const events = [];
		session = await createLocalTcpRelaySession(
			{ payload: { host: "fixture.invalid", port: 443 } },
			(type, payload) => {
				events.push({ type, payload });
			},
			{
				resolveDestination: async () => ({
					address: "127.0.0.1",
					family: 4,
					port
				}),
				connectSocket: options => net.connect(options)
			}
		);
		assert.equal(events[0].type, "tcp.opened");
		const outbound = Buffer.from([0, 1, 127, 128, 254, 255]);
		await session.write(outbound.toString("base64"));
		await waitFor(() => {
			return events.some(event => event.type === "tcp.data");
		});
		const data = events.find(event => event.type === "tcp.data");
		assert.deepEqual(
			Buffer.from(data.payload.data, "base64"),
			outbound
		);
	} finally {
		session?.destroy();
		await new Promise(resolve => {
			echo.close(resolve);
		});
	}
});
