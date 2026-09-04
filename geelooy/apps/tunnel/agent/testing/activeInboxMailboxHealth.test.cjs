// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const Health = require("../lib/connection-vessel/child-health.js");

/**
 * @file Proves degraded inbox grace comes only from exact non-stale custody ownership.
 * @description
 * The Awtsmoos never lets a stage counter impersonate one named deed in flight;
 * Awtsmoos.com grants grace only when every current receipt has exact living custody light.
 * Transport, execution, outbound debt, and stale ownership remain separate witnesses of right.
 */
test("exact active custody grants degraded inbox grace", () => {
	const result = compose({
		inboxCount: 2,
		activeCustody: 2
	});
	assert.equal(result.healthy, true);
	assert.equal(result.mailboxHealthy, true);
	assert.equal(result.mailbox.activeExecutionGrace, true);
	assert.equal(result.mailbox.activeCustodyCount, 2);
	assert.equal(result.mailbox.rawState, "degraded");
});

test("missing, partial, or stale exact custody cannot grant grace", () => {
	assert.equal(compose({ inboxCount: 1 }).healthy, false);
	assert.equal(compose({ inboxCount: 2, activeCustody: 1 }).healthy, false);
	assert.equal(compose({ inboxCount: 1, activeCustody: 1, staleCustody: 1 }).healthy, false);
});

test("stalled, full, or outbound degradation is never forgiven", () => {
	assert.equal(compose({ inboxCount: 1, activeCustody: 1, inboxState: "stalled" }).healthy, false);
	assert.equal(compose({ inboxCount: 1, activeCustody: 1, inboxState: "full" }).healthy, false);
	assert.equal(compose({ inboxCount: 1, activeCustody: 1, outboxState: "degraded" }).healthy, false);
});

test("execution trouble disables exact-custody grace", () => {
	assert.equal(compose({ inboxCount: 1, activeCustody: 1, executionHealthy: false }).healthy, false);
	assert.equal(compose({ inboxCount: 1, activeCustody: 1, backpressured: true }).healthy, false);
	assert.equal(compose({ inboxCount: 1, activeCustody: 1, consumerStalled: true }).healthy, false);
});

test("transport health remains independently mandatory", () => {
	const result = compose({
		inboxCount: 1,
		activeCustody: 1,
		transportHealthy: false
	});
	assert.equal(result.mailbox.activeExecutionGrace, true);
	assert.equal(result.healthy, false);
	assert.equal(result.state, "transport_unhealthy");
});

function compose(options = {}) {
	const inboxState = options.inboxState || "degraded";
	const outboxState = options.outboxState || "healthy";
	const mailboxState = strongest(inboxState, outboxState);
	const custody = exactCustody(options.activeCustody || 0);
	const staleIds = custody
		.slice(0, options.staleCustody || 0)
		.map(record => record.id);
	return Health.compose(transport(options), execution(options), {
		health: {
			healthy: mailboxState === "healthy",
			state: mailboxState
		},
		inbox: {
			state: inboxState,
			count: options.inboxCount || 0,
			oldestAgeMs: 90000,
			parentCustodyRecords: custody,
			parentCustodyStaleIds: staleIds
		},
		outbox: {
			state: outboxState,
			count: outboxState === "healthy" ? 0 : 1,
			oldestAgeMs: outboxState === "healthy" ? 0 : 90000
		}
	});
}

function exactCustody(count) {
	return Array.from({ length: count }, (_, index) => ({
		id: `receipt-${index + 1}`,
		phase: index % 2 === 0 ? "running" : "worker_starting"
	}));
}

function transport(options) {
	const healthy = options.transportHealthy !== false;
	return {
		activeWs: {
			opened: healthy
		},
		registrationConfirmed: healthy
	};
}

function execution(options) {
	const healthy = options.executionHealthy !== false;
	return {
		healthy,
		execution: {
			healthy,
			consumerStalled: options.consumerStalled === true,
			backpressured: options.backpressured === true,
			repairing: options.repairing === true
		}
	};
}

function strongest(inbox, outbox) {
	for (const state of ["full", "stalled", "degraded", "healthy"]) {
		if (inbox === state || outbox === state) return state;
	}
	return "healthy";
}
