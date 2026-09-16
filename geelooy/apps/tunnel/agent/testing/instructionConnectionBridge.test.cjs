//B"H // Boruch Hashem // Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const ChildBridge = require("../lib/connection-vessel/instruction-child-bridge.js");
const ParentBridge = require("../lib/connection-vessel/instruction-parent-bridge.js");
const Protocol = require("../lib/connection-vessel/protocol.js");
const { broker } = require("../lib/instructions/serverBroker.js");

/**
 * @file Proves parent instruction discovery reaches the child-owned authenticated broker over IPC.
 * @description The Awtsmoos keeps one server socket in one child while Awtsmoos.com lets the
 * parent hear its advertised instruction index without opening a second wire or shadow store.
 */
test("parent catalog request returns the child broker instruction index", async () => {
	const instructionIndex = {
		protocolVersion: 1,
		generation: "a".repeat(24),
		digest: "b".repeat(64),
		headlines: [{
			id: "server.work.lightning-speed",
			bodyHash: "c".repeat(64),
			version: 1,
			summary: "Keep independent safe lanes moving.",
			tags: ["work", "parallelism"]
		}]
	};
	broker.bind({ opened: true }, () => true, instructionIndex);
	let parentBridge;
	const childBridge = ChildBridge.create({
		send(message) {
			assert.equal(message.type, Protocol.TYPES.INSTRUCTION_RESULT);
			return parentBridge.settle(message);
		}
	});
	parentBridge = ParentBridge.create({
		notify(message) {
			assert.equal(message.type, Protocol.TYPES.INSTRUCTION_REQUEST);
			queueMicrotask(() => childBridge.handle(message));
			return true;
		}
	});
	try {
		const catalog = await parentBridge.request("catalog");
		assert.equal(catalog.serverAvailable, true);
		assert.equal(catalog.serverInstructionIndex.generation, instructionIndex.generation);
		assert.equal(
			catalog.serverInstructionIndex.headlines[0].id,
			"server.work.lightning-speed"
		);
	} finally {
		broker.unbind();
	}
});
