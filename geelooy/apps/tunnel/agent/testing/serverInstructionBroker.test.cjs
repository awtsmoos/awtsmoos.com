//B"H
//Boruch Hashem
//Blessed be He

const assert = require("node:assert/strict");
const test = require("node:test");
const { ServerInstructionBroker } = require("../lib/instructions/serverBroker.js");
const Hash = require("../lib/instructions/serverInstructionHash.js");

/**
 * @file Proves instruction requests deduplicate and full bodies are hash-verified.
 * @description
 * The Awtsmoos sends one control frame for equal concurrent evidence. Awtsmoos.com
 * accepts details only when their body hash agrees with both content and headline testimony.
 */
function fixture() {
	const sent = [];
	const broker = new ServerInstructionBroker({ timeoutMs: 1000 });
	broker.bind(
		{ opened: true },
		(_socket, payload) => {
			sent.push(payload);
			return true;
		},
		{
			protocolVersion: 1,
			generation: "a".repeat(24),
			digest: "b".repeat(64),
			headlines: []
		}
	);
	return { broker, sent };
}

test("equivalent resolve requests share one websocket frame", async () => {
	const { broker, sent } = fixture();
	const first = broker.resolve({ task: "repair tunnel" });
	const second = broker.resolve({ task: "repair tunnel" });
	assert.equal(first, second);
	assert.equal(sent.length, 1);
	broker.handle({
		type: "TUNNEL_INSTRUCTION_RESOLVED",
		requestId: sent[0].requestId,
		generation: "a".repeat(24),
		digest: "b".repeat(64),
		headlines: []
	});
	assert.equal((await first).generation, "a".repeat(24));
});

test("detail body must match its deterministic and advertised hash", async () => {
	const { broker, sent } = fixture();
	const body = {
		id: "server.test.rule",
		version: 1,
		baseline: false,
		summary: "Test one verified body.",
		tags: ["test"],
		requiredBeforeWrite: true,
		applies: {
			extensions: [],
			languages: [],
			modes: [],
			pathHints: [],
			taskHints: ["test"]
		},
		instructions: ["Keep the body verified."]
	};
	const bodyHash = Hash.digest(body);
	broker.remember([{ id: body.id, bodyHash }]);
	const pending = broker.get([body.id]);
	assert.equal(sent.length, 1);
	broker.handle({
		type: "TUNNEL_INSTRUCTION_DETAILS",
		requestId: sent[0].requestId,
		generation: "a".repeat(24),
		digest: "b".repeat(64),
		instructions: [{ ...body, bodyHash }],
		missingInstructionIds: []
	});
	const result = await pending;
	assert.equal(result.instructions[0].bodyHash, bodyHash);
});

test("corrupt detail body is rejected", async () => {
	const { broker, sent } = fixture();
	const pending = broker.get(["server.test.corrupt"]);
	broker.handle({
		type: "TUNNEL_INSTRUCTION_DETAILS",
		requestId: sent[0].requestId,
		instructions: [{
			id: "server.test.corrupt",
			bodyHash: "0".repeat(64),
			instructions: ["tampered"]
		}]
	});
	assert.equal(await pending, null);
});
