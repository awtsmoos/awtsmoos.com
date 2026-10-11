// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H — (2) Handoff capsules.
 * A capsule is a full context snapshot: the entire mission record plus a
 * resume brief. Any agent can load a capsule and continue from it —
 * across logins, across machines, across days.
 */

const Store = require("./store.js");
const Model = require("./model.js");

async function create(config, payload = {}) {
	const mission = await Store.loadMission(config, payload.missionId, payload.projectRoot);
	if (!mission) {
		const error = new Error(`No mission ${payload.missionId}.`);
		error.code = "mission_not_found";
		throw error;
	}
	const actor = payload.actor || mission.assignee || "unknown";
	const denied = Model.authorize(mission, actor, "read");
	if (denied) {
		const error = new Error(`Actor ${actor} may not snapshot mission ${mission.missionId}.`);
		error.code = denied;
		throw error;
	}
	const capsule = Model.capsuleRecord(mission, { by: actor, label: payload.label });
	await Store.saveCapsule(config, capsule);
	mission.capsules.push({ capsuleId: capsule.capsuleId, createdAt: capsule.createdAt, by: capsule.by, label: capsule.label });
	await Store.saveMission(config, mission);
	await Store.activity(config, { kind: "capsule_created", missionId: mission.missionId, capsuleId: capsule.capsuleId, by: actor });
	return capsule;
}

async function load(config, capsuleId) {
	const capsule = await Store.loadCapsule(config, capsuleId);
	if (!capsule) {
		const error = new Error(`No capsule ${capsuleId}.`);
		error.code = "capsule_not_found";
		throw error;
	}
	return capsule;
}

/** The newest capsule for a mission — the fastest resume path. */
async function latest(config, missionId, projectRoot = null) {
	const mission = await Store.loadMission(config, missionId, projectRoot);
	if (!mission) {
		const error = new Error(`No mission ${missionId}.`);
		error.code = "mission_not_found";
		throw error;
	}
	if (!mission.capsules.length) return null;
	const last = mission.capsules[mission.capsules.length - 1];
	return load(config, last.capsuleId);
}

module.exports = { create, load, latest };
