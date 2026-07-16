// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const path = require("node:path");
const { IsolatedRelay } = require("./helpers/isolatedRelay/server.cjs");
const Fixture = require("./helpers/isolatedRelay/fixture.cjs");
const Support = require("./helpers/isolatedRelay/testSupport.cjs");

/**
 * @file Runs actual agent source through drop, delayed ACK, work, and half-open faults.
 * @description
 * The Awtsmoos renews one PID through three socket generations. Awtsmoos.com proves
 * the candidate keeps its immutable tunnel ID, answers work after reconnect, expires
 * silent transport, rejects a duplicate process, and returns to registered health.
 */
(async () => {
	const relay = new IsolatedRelay({
		tunnelId: "tun_isolated_longevity",
		ackDelay: sequence => sequence === 2 ? 650 : 0
	});
	await relay.listen();
	const fixture = Fixture.createFixture(relay.address(), {
		tunnelId: relay.tunnelId
	});
	const child = fixture.spawnAgent();
	const childLog = Support.captureChild(child);
	let duplicate = null;
	try {
		await registrationCount(relay, 1);
		const firstReceipt = await registeredReceipt(fixture, child.pid, 1);
		assert.equal(firstReceipt.tunnelId, fixture.tunnelId);
		assert.equal(Support.isAlive(child.pid), true);

		const first = relay.latest();
		first.sendJson({ type: "TUNNEL_PING" });
		await messageWhere(relay, value => value.type === "TUNNEL_PONG");
		first.destroy();

		await registrationCount(relay, 2);
		const secondReceipt = await registeredReceipt(fixture, child.pid, 2);
		assert.equal(secondReceipt.tunnelId, fixture.tunnelId);
		assert.equal(Support.isAlive(child.pid), true);

		const second = relay.latest();
		second.sendJson({
			type: "TUNNEL_REQUEST",
			id: "isolated-stat-1",
			requesterKey: "isolated-test",
			payload: { action: "stat", p: "." }
		});
		const response = await messageWhere(
			relay,
			value => value.type === "TUNNEL_RESPONSE" && value.id === "isolated-stat-1",
			12000
		);
		assert.equal(response.ok, true, JSON.stringify(response));

		second.respondToPing = false;
		await registrationCount(relay, 3, 15000);
		const thirdReceipt = await registeredReceipt(fixture, child.pid, 3);
		assert.equal(thirdReceipt.tunnelId, fixture.tunnelId);
		assert.equal(thirdReceipt.reconnectAttempt, 0);
		assert.equal(Support.isAlive(child.pid), true);

		const registrationsBeforeDuplicate = relay.registrations.length;
		duplicate = fixture.spawnAgent();
		const duplicateLog = Support.captureChild(duplicate);
		await Support.waitUntil(() => duplicate.exitCode !== null, 8000);
		assert.equal(duplicate.exitCode, 0, duplicateLog.stderr);
		await Support.delay(500);
		assert.equal(relay.registrations.length, registrationsBeforeDuplicate);
		assert.match(duplicateLog.stdout, /duplicate|isolated_agent_started/i);

		console.log(JSON.stringify({
			ok: true,
			suite: "isolated-agent-longevity",
			pid: child.pid,
			generations: thirdReceipt.generation,
			registrations: relay.registrations.length,
			dropRecovered: true,
			delayedAckRecovered: true,
			halfOpenRecovered: true,
			postReconnectActionPassed: true,
			duplicateProcessRefused: true
		}, null, 2));
	} catch (error) {
		error.message += `\nchild stdout:\n${childLog.stdout}\nchild stderr:\n${childLog.stderr}`;
		throw error;
	} finally {
		await Support.stopChild(duplicate);
		await Support.stopChild(child);
		await relay.close().catch(() => {});
		fixture.cleanup();
	}
})().catch(error => {
	console.error(error);
	process.exitCode = 1;
});

function registrationCount(relay, minimum, timeoutMs = 12000) {
	return Support.waitUntil(() => relay.registrations.length >= minimum, timeoutMs);
}

function registeredReceipt(fixture, pid, minimumGeneration) {
	return Support.waitUntil(() => {
		const receipt = fixture.readReceipt();
		return receipt?.state === "registered" &&
			receipt.pid === pid &&
			receipt.generation >= minimumGeneration && receipt;
	}, 12000);
}

function messageWhere(relay, predicate, timeoutMs = 8000) {
	return Support.waitUntil(() => {
		const found = relay.messages.map(entry => entry.message).find(predicate);
		return found || false;
	}, timeoutMs);
}
