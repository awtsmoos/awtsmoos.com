// B"H

import assert from "node:assert/strict";
import { createRequire } from "node:module";

process.env.AWTSMOOS_FS_EXECUTOR_TEST_MODE = "1";
process.env.AWTSMOOS_FS_EXECUTOR_WORKERS = "2";

const require = createRequire(import.meta.url);
const { IsolatedRelay } = require("../../agent/testing/helpers/isolatedRelay/server.cjs");
const Fixture = require("../../agent/testing/helpers/isolatedRelay/fixture.cjs");
const Support = require("../../agent/testing/helpers/isolatedRelay/testSupport.cjs");

const relay = new IsolatedRelay({ tunnelId: "tun_heartbeat_isolation" });
await relay.listen();
const fixture = Fixture.createFixture(relay.address(), {
	tunnelId: relay.tunnelId,
	tunnelName: "awt-heartbeat-isolation"
});
const child = fixture.spawnAgent();
const childLog = Support.captureChild(child);

try {
	await Support.waitUntil(() => relay.registrations.length >= 1, 15000);
	const socket = relay.latest();
	for (let index = 0; index < 20; index += 1) {
		socket.sendJson({
			id: `blocked-${index}`,
			payload: {
				action: "executorTestBlock",
				blockMs: index === 0 ? 1500 : 120,
				logicalAgentId: `agent-${index}`
			},
			type: "TUNNEL_REQUEST"
		});
	}

	let maximumPongMs = 0;
	for (let index = 0; index < 10; index += 1) {
		const previous = messages("TUNNEL_PONG").length;
		const startedAt = Date.now();
		socket.sendJson({ type: "TUNNEL_PING" });
		await Support.waitUntil(
			() => messages("TUNNEL_PONG").length > previous,
			3000,
			10
		);
		maximumPongMs = Math.max(maximumPongMs, Date.now() - startedAt);
		await Support.delay(40);
	}

	const responses = await Support.waitUntil(() => {
		const found = messages("TUNNEL_RESPONSE")
			.filter(message => String(message.id).startsWith("blocked-"));
		return found.length === 20 && found;
	}, 20000);
	assert.ok(responses.every(response => response.ok), JSON.stringify(responses));
	assert.ok(maximumPongMs < 1200, `pong latency reached ${maximumPongMs}ms`);
	assert.equal(Support.isAlive(child.pid), true);
	console.log(JSON.stringify({
		ok: true,
		suite: "unix-agent-heartbeat-isolation",
		concurrentAgents: 20,
		maximumPongMs
	}));
} catch (error) {
	error.message += `\nchild stdout:\n${childLog.stdout}\nchild stderr:\n${childLog.stderr}`;
	throw error;
} finally {
	await Support.stopChild(child);
	await relay.close().catch(() => {});
	fixture.cleanup();
}

function messages(type) {
	return relay.messages
		.map(entry => entry.message)
		.filter(message => message.type === type);
}
