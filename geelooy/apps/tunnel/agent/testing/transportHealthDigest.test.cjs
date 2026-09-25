// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Publisher = require("../lib/connection-vessel/child-health-publisher.js");
const { TinyWebSocket } = require("../lib/ws/client.js");

/**
 * @file Proves the TUNNEL_HEALTH digest carries transport-liveness testimony
 * (B10b) and that ping round-trips are measured (G3) — additively, without
 * disturbing any existing digest field.
 * @description
 * The Awtsmoos lets the relay tell a silent transport from a healthy child:
 * idle time, ping age, ping RTT, the live death threshold, and scheduler-grace
 * state ride the digest as bounded numbers. Absent liveness omits the section
 * cleanly instead of inventing testimony.
 */

function registeredSnapshot(overrides = {}) {
	return {
		registered: true,
		connected: true,
		generation: 7,
		lastRegisteredAt: Date.now() - 1000,
		fullHealth: {
			healthy: true,
			state: "healthy",
			transportHealthy: true,
			executionHealthy: true,
			mailboxHealthy: true,
			mailboxState: "healthy",
			mailbox: { inboxCount: 1, inboxOldestAgeMs: 5, outboxCount: 0, outboxOldestAgeMs: 0 }
		},
		executionHealth: { healthy: true },
		parentCustody: {},
		...overrides
	};
}

// 1. Digest carries the transport section with bounded numeric fields.
{
	const view = {
		clockDomain: "monotonic",
		deadIdleMs: 90000,
		idleMs: 2345,
		lastPingAgeMs: 1200,
		pingIdleMs: 20000,
		pongRttMs: 87,
		schedulerGraceActive: false
	};
	const health = Publisher.publicHealth(registeredSnapshot({ transportLiveness: view }));
	assert.ok(health.transport, "transport section present");
	assert.equal(health.transport.idleMs, 2345);
	assert.equal(health.transport.pongRttMs, 87);
	assert.equal(health.transport.deadIdleMs, 90000);
	assert.equal(health.transport.lastPingAgeMs, 1200);
	assert.equal(health.transport.schedulerGraceActive, false);
	assert.equal(health.transport.clockDomain, "monotonic");
}

// 2. Absent liveness omits the section cleanly — no invented testimony.
{
	const bare = Publisher.publicHealth(registeredSnapshot());
	assert.equal("transport" in bare, false, "transport key omitted when absent");
	const nulled = Publisher.publicHealth(registeredSnapshot({ transportLiveness: null }));
	assert.equal("transport" in nulled, false, "transport key omitted when null");
}

// 3. No regression: every pre-existing digest field is untouched.
{
	const health = Publisher.publicHealth(registeredSnapshot({ transportLiveness: { idleMs: 1 } }));
	assert.equal(health.healthy, true);
	assert.equal(health.state, "healthy");
	assert.equal(health.transportHealthy, true);
	assert.equal(health.executionHealthy, true);
	assert.equal(health.mailboxHealthy, true);
	assert.equal(health.connection.generation, 7);
	assert.ok(health.connection.lastRegisteredAt > 0);
	assert.equal(health.mailbox.inboxCount, 1);
}

// 4. transportLivenessView projects a fake socket's liveness into digest shape.
{
	let mono = 100000;
	const state = {
		activeWs: {
			pongRttMs: 42,
			liveness: {
				snapshot: () => ({
					lastInboundAt: mono - 5000,
					lastPingAt: mono - 1500,
					deadIdleMs: 45000,
					pingIdleMs: 20000,
					schedulerGraceActive: true
				})
			}
		}
	};
	const view = Publisher.transportLivenessView(state, mono);
	assert.equal(view.idleMs, 5000);
	assert.equal(view.lastPingAgeMs, 1500);
	assert.equal(view.pongRttMs, 42);
	assert.equal(view.deadIdleMs, 45000);
	assert.equal(view.schedulerGraceActive, true);
	assert.equal(view.clockDomain, "monotonic");
}

// 5. transportLivenessView returns null without a socket (clean omission).
{
	assert.equal(Publisher.transportLivenessView({}), null);
	assert.equal(Publisher.transportLivenessView({ activeWs: null }), null);
	assert.equal(Publisher.transportLivenessView({ activeWs: {} }), null);
}

// 6. G3: ping() arms the RTT timer; notePong() records a bounded round trip.
{
	const ws = new TinyWebSocket("ws://example.invalid");
	const pongs = [];
	ws.on("pong", payload => pongs.push(payload));
	assert.equal(ws.pongRttMs, 0);
	ws.ping("probe-1");
	assert.ok(ws.lastPingSentAtMono > 0, "ping send time recorded");
	const rtt = ws.notePong("probe-1");
	assert.ok(Number.isFinite(rtt) && rtt >= 0 && rtt <= 3600000, "bounded RTT");
	assert.equal(ws.pongRttMs, rtt);
	assert.equal(ws.lastPingSentAtMono, 0, "ping no longer outstanding");
	assert.deepEqual(pongs, ["probe-1"], "pong still emitted");
}

// 7. G3: unsolicited pongs are ignored, never invented into RTT testimony.
{
	const ws = new TinyWebSocket("ws://example.invalid");
	ws.notePong("unsolicited");
	assert.equal(ws.pongRttMs, 0, "no ping outstanding -> RTT stays 0");
}

// 8. G3: a real pong frame arriving through the frame stream flows through the
// RTT recorder (integration: frame layer -> notePong -> pong emit).
{
	const ws = new TinyWebSocket("ws://example.invalid");
	const pongs = [];
	ws.on("pong", payload => pongs.push(String(payload)));
	ws.ping("probe-2");
	const payload = Buffer.from("probe-2", "utf8");
	// Minimal RFC 6455 server pong frame: FIN + opcode 0xA, unmasked.
	const frame = Buffer.concat([Buffer.from([0x8a, payload.length]), payload]);
	ws.frames.consume(frame);
	assert.deepEqual(pongs, ["probe-2"], "onPong still emits pong");
	assert.equal(ws.lastPingSentAtMono, 0, "RTT consumed by onPong path");
	assert.ok(ws.pongRttMs >= 0 && ws.pongRttMs <= 3600000, "RTT recorded");
}

// 9. Digest bounds hostile numbers instead of passing them through.
{
	const health = Publisher.publicHealth(registeredSnapshot({
		transportLiveness: {
			idleMs: Number.POSITIVE_INFINITY,
			pongRttMs: -50,
			deadIdleMs: 1e15,
			lastPingAgeMs: NaN
		}
	}));
	assert.ok(Number.isFinite(health.transport.idleMs), "idleMs finite");
	assert.equal(health.transport.pongRttMs, 0, "negative RTT clamped");
	assert.ok(health.transport.deadIdleMs <= 3600000, "deadIdleMs bounded");
}

console.log(JSON.stringify({
	ok: true,
	suite: "transport-health-digest",
	transportTestimony: true,
	pingRttMeasured: true
}, null, 2));
