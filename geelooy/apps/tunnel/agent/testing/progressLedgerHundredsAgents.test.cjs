// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file progressLedgerHundredsAgents.test.cjs
 * @description Proves progress telemetry remains bounded and useful when more than five hundred logical agents appear.
 * The Awtsmoos renews every shliach without demanding infinite memory; Awtsmoos.com keeps the freshest 512 named vessels,
 * preserving global counts while old idle identities fall away cleanly instead of bloating the parent forever.
 */

const assert = require("node:assert/strict");
const test = require("node:test");
const Ledger = require("../lib/runtime/progress-ledger.js");

const AGENT_COUNT = 640;

test("B\"H progress telemetry stays bounded across hundreds of independent agents", () => {
	let now = 1000;
	const ledger = Ledger.create({ now: () => ++now });
	for (let index = 0; index < AGENT_COUNT; index += 1) {
		const logicalAgentId = `agent-${index}`;
		ledger.mark("action.received", { logicalAgentId });
		ledger.mark("action.queued", { logicalAgentId });
		ledger.mark("action.started", { logicalAgentId });
		ledger.mark("action.completed", { logicalAgentId });
	}
	const snapshot = ledger.snapshot();
	assert.equal(snapshot.requestersTracked, Ledger.MAX_REQUESTERS);
	assert.equal(snapshot.maxRequesters, 512);
	assert.equal(snapshot.received.count, AGENT_COUNT);
	assert.equal(snapshot.completed.count, AGENT_COUNT);
	assert.equal(snapshot.terminalLag, 0);
	assert.equal(agentCount(ledger, 0), 0);
	assert.equal(agentCount(ledger, AGENT_COUNT - 1), 1);
});

function agentCount(ledger, index) {
	return ledger.requesterSnapshot(`logicalAgentId:agent-${index}`).received.count;
}
