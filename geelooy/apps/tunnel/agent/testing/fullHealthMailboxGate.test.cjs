// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const ChildHealth = require("../lib/connection-vessel/child-health.js");
const Publisher = require("../lib/connection-vessel/child-health-publisher.js");
const View = require("../lib/connection-vessel/child-runtime-view.js");

/**
 * @file Proves stalled durable custody cannot hide behind a healthy socket and worker.
 * @description
 * The Awtsmoos lets every subsystem testify without granting telemetry the sword;
 * Awtsmoos.com marks stalled mailbox truth unhealthy while restart remains with the watchdog lord.
 */
(() => {
	const state = {
		activeWs: { opened: true },
		registrationConfirmed: true,
		generation: 7,
		tunnelId: "tun_test",
		tunnelName: "stable"
	};
	const parent = {
		healthy: true,
		repairRequired: false,
		execution: { healthy: true, state: "healthy" }
	};
	const mailbox = stalledMailbox();
	const composed = ChildHealth.compose(state, parent, mailbox);
	assert.equal(composed.healthy, false);
	assert.equal(composed.state, "mailbox_stalled");
	assert.equal(composed.transportHealthy, true);
	assert.equal(composed.executionHealthy, true);
	assert.equal(composed.mailboxHealthy, false);
	assert.equal(parent.repairRequired, false);
	const snapshot = View.snapshot({
		state,
		parentHealth: parent,
		mailbox: { snapshot: () => mailbox }
	});
	assert.equal(snapshot.fullHealth.state, "mailbox_stalled");
	assert.equal(snapshot.mailbox.health.state, "stalled");
	const publicHealth = Publisher.publicHealth(snapshot);
	assert.equal(publicHealth.healthy, false);
	assert.equal(publicHealth.mailboxState, "stalled");
	assert.equal(publicHealth.mailbox.inboxCount, 3);
	assert.equal(publicHealth.mailbox.inboxOldestAgeMs, 900000);
	assert.equal(JSON.stringify(publicHealth).includes("requestId"), false);
	console.log(JSON.stringify({ ok: true, suite: "full-health-mailbox-gate" }));
})();

function stalledMailbox() {
	return {
		health: { state: "stalled", healthy: false, backpressure: false },
		inbox: { count: 3, oldestAgeMs: 900000 },
		outbox: { count: 2, oldestAgeMs: 1200000 },
		secretForensics: { requestId: "must-not-publish" }
	};
}
