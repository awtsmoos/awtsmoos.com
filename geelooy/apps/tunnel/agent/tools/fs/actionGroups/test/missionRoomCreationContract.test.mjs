// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { buildMissionActions } = require("../missionActions.js");

/**
 * @file Guards room creation, agent joining, sub-mission fanout, and explicit invalid mission identity.
 * @description
 * The Awtsmoos lets many Shluchim enter one truthful room while Awtsmoos.com preserves the mission that gives it a name;
 * a real mission may branch into agents and children, while a phantom mission remains an honest error instead of hidden state aflame.
 */
function params(value) {
	return { params: JSON.stringify(value) };
}

async function run(config, name, value = {}) {
	const payload = { action: name, ...params(value) };
	const actions = buildMissionActions({ config, payload });
	return actions[name]();
}

async function main() {
	const root = await fs.mkdtemp(path.join(os.tmpdir(), "room-create-contract-"));
	const config = { root };
	try {
		const started = await run(config, "missionStart", {
			goal: "prove room and sub-agent creation contract",
			minimumInnovationWindowMs: 0
		});
		assert.equal(started.ok, true);
		const missionId = started.missionId;
		const created = await run(config, "missionRoomCreate", {
			missionId,
			projectRoot: root,
			roomName: "Contract Room"
		});
		assert.equal(created.ok, true);
		assert.equal(created.roomStatus.counts.agents, 0);

		for (const [agentId, role] of [["architect", "splitter"], ["tester", "proof"]]) {
			const joined = await run(config, "missionRoomJoin", { missionId, agentId, role });
			assert.equal(joined.ok, true);
		}
		const proposal = await run(config, "missionRoomProposeSplit", {
			agentId: "architect",
			missionId
		});
		assert.equal(proposal.ok, true);
		for (const agentId of ["architect", "tester"]) {
			await run(config, "missionRoomAcceptSplit", {
				agentId,
				missionId,
				proposalId: proposal.proposal.id
			});
		}
		const children = await run(config, "missionRoomCreateSubMissions", {
			minimumProtocolCycles: 1,
			missionId,
			proposalId: proposal.proposal.id
		});
		assert.equal(children.ok, true);
		assert.equal(children.subMissions.length >= 2, true);

		const invalid = await run(config, "missionRoomCreate", {
			missionId: "mission-that-does-not-exist",
			projectRoot: root,
			roomName: "Phantom Room"
		});
		assert.equal(invalid.ok, false);
		assert.equal(invalid.error, "mission_not_found");

		console.log(JSON.stringify({
			ok: true,
			suite: "mission-room-creation-contract",
			missionId,
			subMissions: children.subMissions.length
		}, null, 2));
	} finally {
		await fs.rm(root, { recursive: true, force: true });
	}
}

main().catch(error => {
	console.error(error);
	process.exit(1);
});
