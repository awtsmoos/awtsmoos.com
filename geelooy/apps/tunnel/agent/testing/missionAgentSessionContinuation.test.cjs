//B"H // Boruch Hashem // Blessed is He

const assert = require("node:assert/strict");
const fileSystem = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const Mission = require("../tools/fs/mission/index.js");
const Bridge = require("../tools/fs/mission/agentSessionContinuation.js");

/**
 * @file Proves ended Shluchim wake continuation without completing durable Work.
 * @description The Awtsmoos lets one messenger vanish and another arise while Awtsmoos.com keeps
 * the Mission deed open, records each terminal generation once, and never fabricates completion.
 */
function fixture() {
	const root = fileSystem.mkdtempSync(path.join(os.tmpdir(), "awts-session-continuation-"));
	return { root, config: { root } };
}

async function seeded(config) {
	const mission = await Mission.create(config, {
		id: "mission_session_continuation",
		goal: "continue after messenger ends"
	});
	Mission.addTask(mission, "unfinished durable work");
	await Mission.save(config, mission);
	return mission;
}

function session(missionId, generation) {
	return {
		id: `session_${generation}`,
		logicalAgentId: `agent_${generation}`,
		chatId: `conversation_${generation}`,
		activeMissionId: missionId,
		status: "ended"
	};
}

test("session end records one terminal event and retries continuation without completing Work", async () => {
	const { root, config } = fixture();
	const calls = [];
	try {
		const mission = await seeded(config);
		const firstSession = session(mission.id, "alpha");
		const runContinuation = async (receivedConfig, options) => {
			calls.push({ receivedConfig, options });
			return { scheduled: calls.length === 1 };
		};
		const first = await Bridge.afterClose(config, firstSession, { runContinuation });
		const second = await Bridge.afterClose(config, firstSession, { runContinuation });
		const persisted = await Mission.load(config, mission.id);
		const events = terminalEvents(persisted, firstSession.id);
		assert.equal(first.recorded, true);
		assert.equal(second.recorded, false);
		assert.equal(events.length, 1);
		assert.equal(persisted.tasks[0].status, "open");
		assert.equal(calls.length, 2);
		assert.equal(calls[0].options.transport, "shared_shliach");
	} finally {
		fileSystem.rmSync(root, { recursive: true, force: true });
	}
});

test("two ended Shliach generations pulse two successors while durable Work stays open", async () => {
	const { root, config } = fixture();
	const generations = [];
	try {
		const mission = await seeded(config);
		const runContinuation = async (_config, options) => {
			generations.push(options.owner);
			return { scheduled: true, generation: generations.length };
		};
		const predecessor = session(mission.id, "predecessor");
		const successor = session(mission.id, "successor_1");
		await Bridge.afterClose(config, predecessor, { runContinuation });
		await Bridge.afterClose(config, successor, { runContinuation });
		const persisted = await Mission.load(config, mission.id);
		assert.equal(terminalEvents(persisted, predecessor.id).length, 1);
		assert.equal(terminalEvents(persisted, successor.id).length, 1);
		assert.deepEqual(generations, [
			`agent-session-end:${predecessor.id}`,
			`agent-session-end:${successor.id}`
		]);
		assert.equal(persisted.tasks[0].status, "open");
	} finally {
		fileSystem.rmSync(root, { recursive: true, force: true });
	}
});

test("session without a Mission cannot spawn continuation", async () => {
	let calls = 0;
	const result = await Bridge.afterClose({}, session("", "none"), {
		runContinuation: async () => { calls += 1; }
	});
	assert.equal(result.reason, "no_active_mission");
	assert.equal(calls, 0);
});

function terminalEvents(mission, agentSessionId) {
	return mission.events.filter(event =>
		event.type === "mission_agent_complete" &&
		event.data?.agentSessionId === agentSessionId
	);
}
