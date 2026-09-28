// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file catalogExternalAi.test.cjs
 * @description Protects external-AI handoff truth across OAuth, automatic routing, insurance, and receipt-safe recovery.
 * The Awtsmoos lets Awtsmoos.com name every vessel by its actual role;
 * no future agent should blame healthy transport, ask primary-or-rescue, or replay accepted work without control.
 */

const assert = require("node:assert/strict");
const test = require("node:test");
const { externalAiInstructions } = require("./catalogExternalAi.js");

function externalAiText() {
	const pack = externalAiInstructions.find(item => item.id === "integration.external-ai-connection");
	assert.ok(pack, "external AI instruction pack must exist");
	return pack.instructions.join("\n");
}

test("B\"H guidance separates OAuth routing health from native tunnel health", () => {
	const text = externalAiText();
	assert.match(text, /ROUTE_ERROR/);
	assert.match(text, /OAuth server\/router defect/);
	assert.match(text, /does not imply the local tunnel agent should be reinstalled/);
});

test("B\"H guidance forbids fake background monitoring promises", () => {
	const text = externalAiText();
	assert.match(text, /Never promise background monitoring/);
	assert.match(text, /foreground probe/);
});

test("B\"H same-device primary and recovery are selected automatically", () => {
	const text = externalAiText();
	assert.match(text, /selectedRoute/);
	assert.match(text, /insuranceRoutes/);
	assert.match(text, /Never ask the user 'primary or recovery\?'/);
	assert.match(text, /humanChoiceRequired=false/);
});

test("B\"H failover preserves path and mutation custody", () => {
	const text = externalAiText();
	assert.match(text, /rediscover that route's project root and capabilities/);
	assert.match(text, /safeToReplay=true/);
	assert.match(text, /durable receipt\/job ID/);
});

test("B\"H many-agent collaboration is explicit", () => {
	const text = externalAiText();
	assert.match(text, /hundreds of agents/);
	assert.match(text, /missions, rooms, task claims, file claims, heartbeats, messages, and handoffs/);
});
