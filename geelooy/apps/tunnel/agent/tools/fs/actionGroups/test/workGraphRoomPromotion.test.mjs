//B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { loadConfig } = require("../../../../lib/config.js");
const MissionStore = require("../../mission/ledger/store.js");
const Knowledge = require("../../workGraph/knowledgeStore.js");
const Query = require("../../workGraph/knowledgeQuery.js");
const Harness = require("./workGraphHarness.js");

/**
 * @file Proves persisted Room speech promotes only deliberate typed meaning with routing intact.
 * @description The Awtsmoos leaves ordinary chat in its living Room while decisions and
 * handoffs cast one permanent, retry-safe shadow visible only to their appointed recipients.
 */
function message(id, kind, body, routing = {}) {
	return {
		id,
		sequence: Number(id.replace(/\D/g, "") || 1),
		at: "2026-09-15T00:00:00.000Z",
		fromAgent: "agent:alpha",
		toAgent: "all",
		toAgents: [],
		toSpawnGroup: "",
		kind,
		subject: `${kind} subject`,
		body,
		references: [],
		requiresResponse: false,
		interrupts: false,
		...routing
	};
}

function mission(messages = []) {
	return {
		id: "mission_room_promotion",
		missionId: "mission_room_promotion",
		remainingWork: [],
		room: { id: "room_promotion", messages }
	};
}

async function main() {
	const sandbox = Harness.createSandbox();
	const config = { ...loadConfig(), ...sandbox.config };
	try {
		await MissionStore.save(config, mission());
		const chat = message("msg_1", "chat", "Ordinary speech stays only in Room.");
		const decision = message("msg_2", "decision", "Persist deliberate architecture decisions.");
		await MissionStore.save(config, mission([chat, decision]));
		assert.deepEqual((await Knowledge.all(config)).map(item => item.kind), ["decision"]);
		await MissionStore.save(config, mission([chat, decision]));
		assert.equal((await Knowledge.all(config)).length, 1);

		const privateHandoff = message("msg_3", "handoff", "Beta owns the next verification.", {
			toAgent: "agent:beta"
		});
		const groupHandoff = message("msg_4", "handoff", "Spawn group red continues this work.", {
			toAgent: "spawn_group",
			toSpawnGroup: "spawn:red"
		});
		await MissionStore.save(config, mission([chat, decision, privateHandoff, groupHandoff]));
		assert.equal((await Knowledge.all(config)).length, 3);

		const gamma = await Query.search(config, {}, { logicalAgentId: "agent:gamma" });
		assert.equal(gamma.assertions.some(item => item.messageId === "msg_3"), false);
		assert.equal(gamma.assertions.some(item => item.messageId === "msg_4"), false);
		const beta = await Query.search(config, {}, { logicalAgentId: "agent:beta" });
		assert.equal(beta.assertions.some(item => item.messageId === "msg_3"), true);
		const red = await Query.search(config, {}, {
			logicalAgentId: "agent:gamma",
			spawnGroupId: "spawn:red"
		});
		assert.equal(red.assertions.some(item => item.messageId === "msg_4"), true);
		console.log(JSON.stringify({ ok: true, suite: "work-graph-room-promotion" }));
	} finally {
		Harness.cleanupSandbox(sandbox);
	}
}

main().catch(error => {
	console.error(error?.stack || error);
	process.exitCode = 1;
});
