// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const Mission = require("../../mission/index.js");

/**
 * @file Proves one/some/all/team routing remains mutually precise in one shared room.
 * @description
 * The Awtsmoos lets a human or agent address one vessel, a chosen set, a sibling team,
 * or the whole room. Awtsmoos.com exposes only the speech actually addressed to each
 * inbox while keeping every body in one durable room-message record.
 */
const root = await fs.mkdtemp(path.join(os.tmpdir(), "awts-room-modes-"));
const config = { root };

try {
	const mission = await Mission.create(config, { goal: "routing modes", minimumInnovationWindowMs: 0 });
	Mission.roomCreate(mission, { roomName: "Routing Modes", projectRoot: root });
	join(mission, "sender", "coordination");
	join(mission, "agent-a", "team-one");
	join(mission, "agent-b", "team-one");
	join(mission, "agent-c", "team-two");
	say(mission, "one", { toAgent: "agent-a" });
	say(mission, "some", { toAgents: ["agent-a", "agent-c", "agent-a"] });
	say(mission, "all", { toAgent: "all" });
	say(mission, "team", { toSpawnGroup: "team-one" });
	assert.deepEqual(subjects(mission, "agent-a"), ["one", "some", "all", "team"]);
	assert.deepEqual(subjects(mission, "agent-b"), ["all", "team"]);
	assert.deepEqual(subjects(mission, "agent-c"), ["some", "all"]);
	const some = mission.room.messages.find(message => message.subject === "some");
	assert.deepEqual(some.toAgents, ["agent-a", "agent-c"]);
	assert.equal(mission.room.messages.filter(message => message.subject === "some").length, 1);
	console.log(JSON.stringify({
		ok: true,
		suite: "mission-room-routing-modes",
		one: true,
		some: true,
		all: true,
		team: true,
		bodyCopiesPerLogicalMessage: 1
	}, null, 2));
} finally {
	await fs.rm(root, { recursive: true, force: true });
}

function join(mission, agentId, spawnGroupId) {
	Mission.roomJoin(mission, { agentId, spawnGroupId, role: "worker" });
}
function say(mission, subject, route) {
	return Mission.roomMessage(mission, {
		agentId: "sender",
		subject,
		body: `body:${subject}`,
		interrupt: false,
		...route
	});
}

function subjects(mission, agentId) {
	return Mission.roomInbox(mission, {
		agentId,
		afterSequence: 0,
		acknowledge: false,
		limit: 100
	}).messages.map(message => message.subject);
}
