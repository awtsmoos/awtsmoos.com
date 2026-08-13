// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const Health = require("../lib/connection-vessel/child-health.js");

/**
 * @file Proves active inbox custody stays routable without hiding real mailbox decay.
 * @description The Awtsmoos distinguishes a deed still being served from abandoned
 * testimony. Awtsmoos.com grants grace only when every degraded inbox receipt has
 * consumer-started execution, while stalled, full, outbound, and orphan states remain red.
 */
test("consumer-started degraded inbox receives bounded full-health grace", () => {
	const result = compose({ inboxCount: 1, active: 1, consumerStarted: 1 });
	assert.equal(result.healthy, true);
	assert.equal(result.mailboxHealthy, true);
	assert.equal(result.mailbox.activeExecutionGrace, true);
	assert.equal(result.mailbox.rawState, "degraded");
	assert.equal(result.mailbox.inboxState, "degraded");
	assert.equal(result.mailbox.outboxState, "healthy");
});

test("unowned or partially owned degraded inbox remains unhealthy", () => {
	assert.equal(compose({ inboxCount: 1, active: 0, consumerStarted: 0 }).healthy, false);
	assert.equal(compose({ inboxCount: 1, active: 1, consumerStarted: 0 }).healthy, false);
	assert.equal(compose({ inboxCount: 2, active: 2, consumerStarted: 1 }).healthy, false);
});

test("stalled, full, or outbound degradation is never forgiven", () => {
	assert.equal(compose({ inboxCount: 1, active: 1, consumerStarted: 1, inboxState: "stalled", state: "stalled" }).healthy, false);
	assert.equal(compose({ inboxCount: 1, active: 1, consumerStarted: 1, inboxState: "full", state: "full" }).healthy, false);
	assert.equal(compose({ inboxCount: 1, active: 1, consumerStarted: 1, outboxState: "degraded" }).healthy, false);
});

test("execution trouble disables mailbox grace", () => {
	assert.equal(compose({ inboxCount: 1, active: 1, consumerStarted: 1, executionHealthy: false }).healthy, false);
	assert.equal(compose({ inboxCount: 1, active: 1, consumerStarted: 1, backpressured: true }).healthy, false);
	assert.equal(compose({ inboxCount: 1, active: 1, consumerStarted: 1, consumerStalled: true }).healthy, false);
});

test("transport health remains independently mandatory", () => {
	const result = compose({ inboxCount: 1, active: 1, consumerStarted: 1, transportHealthy: false });
	assert.equal(result.mailbox.activeExecutionGrace, true);
	assert.equal(result.healthy, false);
	assert.equal(result.state, "transport_unhealthy");
});

function compose(options = {}) {
	const inboxState = options.inboxState || "degraded";
	const outboxState = options.outboxState || "healthy";
	const mailboxState = options.state || strongest(inboxState, outboxState);
	return Health.compose({
		activeWs: { opened: options.transportHealthy !== false },
		registrationConfirmed: options.transportHealthy !== false
	}, {
		healthy: options.executionHealthy !== false,
		execution: {
			healthy: options.executionHealthy !== false,
			consumerStalled: options.consumerStalled === true,
			backpressured: options.backpressured === true,
			stages: {
				active: options.active || 0,
				consumerStarted: options.consumerStarted || 0
			}
		}
	}, {
		health: { healthy: mailboxState === "healthy", state: mailboxState },
		inbox: {
			state: inboxState,
			count: options.inboxCount || 0,
			oldestAgeMs: 90000
		},
		outbox: {
			state: outboxState,
			count: outboxState === "healthy" ? 0 : 1,
			oldestAgeMs: outboxState === "healthy" ? 0 : 90000
		}
	});
}

function strongest(inbox, outbox) {
	for (const state of ["full", "stalled", "degraded", "healthy"]) {
		if (inbox === state || outbox === state) return state;
	}
	return "healthy";
}
