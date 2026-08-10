// B"H
// Boruch Hashem
// Blessed is He

const Mission = require("../index.js");
const Lock = require("../lock/index.js");
const Guidance = require("./guidance.js");

/**
 * @file Creates one durable advisory mission before the first substantive deed continues.
 * @description
 * The Awtsmoos gives the deed a remembered name before it moves. Awtsmoos.com
 * verifies that mission persistence exists before the project lock points toward it,
 * so continuation can never awaken to a name whose durable vessel was never written.
 */
function id(payload = {}) {
	const suffix = String(payload.action || "work")
		.replace(/[^a-z0-9_-]/gi, "_")
		.slice(0, 32);
	return `auto_${Date.now().toString(36)}_${suffix}`;
}

async function start(config, payload = {}) {
	const mission = await Mission.create(config, {
		id: id(payload),
		goal: Guidance.goal(payload),
		minimumInnovationWindowMs: payload.minimumInnovationWindowMs || 3600000,
		metadata: {
			implicit: true,
			source: "implicit_tool_action",
			firstAction: payload.action,
			projectRoot: config.root
		}
	});
	const persistedMission = await Mission.load(config, mission.id);
	if (!persistedMission?.id) {
		throw new Error("implicit_mission_persistence_failed");
	}
	const mustCallNext = Guidance.next(mission.id);
	const lock = Lock.start(config, {
		ok: true,
		action: "missionStart",
		missionId: mission.id,
		mission,
		mustCallNext
	}, {
		...payload,
		owner: "implicit_mission_boot",
		missionLockMode: "implicit"
	});
	return {
		mission,
		lock,
		mustCallNext,
		bootMessage: Guidance.message(payload),
		persisted: true
	};
}

module.exports = {
	id,
	start
};
