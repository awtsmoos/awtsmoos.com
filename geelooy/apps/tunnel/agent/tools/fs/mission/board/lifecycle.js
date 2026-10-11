// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H — (7) Checkpoint and resume + completion lifecycle.
 * Pause any mission for days: a capsule is snapshotted first, so resume
 * restores zero-loss context. Complete triggers chained follow-ups (8);
 * fail requires an autopsy (10).
 */

const Store = require("./store.js");
const Model = require("./model.js");
const Capsules = require("./capsules.js");
const Chaining = require("./chaining.js");
const Autopsy = require("./autopsy.js");

async function pause(config, payload = {}) {
	const mission = await Store.loadMission(config, payload.missionId, payload.projectRoot);
	if (!mission) {
		const error = new Error(`No mission ${payload.missionId}.`);
		error.code = "mission_not_found";
		throw error;
	}
	const actor = payload.actor || mission.assignee || "unknown";
	const denied = Model.authorize(mission, actor, "mutate");
	if (denied) {
		const error = new Error(`Actor ${actor} may not pause mission ${mission.missionId}.`);
		error.code = denied;
		throw error;
	}
	if (mission.status === "complete" || mission.status === "failed") {
		const error = new Error(`Mission is ${mission.status}; nothing to pause.`);
		error.code = "mission_closed";
		throw error;
	}
	const capsule = await Capsules.create(config, { missionId: mission.missionId, projectRoot: mission.projectRoot, actor, label: payload.label || "pause" });
	// Capsules.create saved its own copy; refresh so we don't clobber the capsule entry.
	const fresh = await Store.loadMission(config, mission.missionId, mission.projectRoot);
	const target = fresh || mission;
	if (fresh && !fresh.capsules.some(c => c.capsuleId === capsule.capsuleId)) {
		fresh.capsules.push({ capsuleId: capsule.capsuleId, createdAt: capsule.createdAt, by: capsule.by, label: capsule.label });
	}
	target.status = "paused";
	target.notes.push(Model.note({ by: actor, text: `Paused. Resume capsule: ${capsule.capsuleId}.` }));
	await Store.saveMission(config, target);
	await Store.activity(config, { kind: "mission_paused", missionId: target.missionId, capsuleId: capsule.capsuleId, by: actor });
	return { mission: target, capsule };
}

async function resume(config, payload = {}) {
	const mission = await Store.loadMission(config, payload.missionId, payload.projectRoot);
	if (!mission) {
		const error = new Error(`No mission ${payload.missionId}.`);
		error.code = "mission_not_found";
		throw error;
	}
	const actor = payload.actor || mission.assignee || mission.createdBy || "unknown";
	if (mission.status !== "paused") {
		const error = new Error(`Mission is ${mission.status}; only paused missions resume.`);
		error.code = "mission_not_paused";
		throw error;
	}
	if (actor !== mission.assignee && actor !== mission.createdBy) {
		const error = new Error(`Only ${mission.assignee || mission.createdBy} may resume this mission.`);
		error.code = "not_assignee_or_creator";
		throw error;
	}
	const capsule = await Capsules.latest(config, mission.missionId, mission.projectRoot);
	mission.status = mission.assignee ? "active" : "open";
	mission.notes.push(Model.note({ by: actor, text: `Resumed with zero context loss${capsule ? ` from capsule ${capsule.capsuleId}` : ""}.` }));
	await Store.saveMission(config, mission);
	await Store.activity(config, { kind: "mission_resumed", missionId: mission.missionId, by: actor });
	return { mission, capsule };
}

async function complete(config, payload = {}) {
	const mission = await Store.loadMission(config, payload.missionId, payload.projectRoot);
	if (!mission) {
		const error = new Error(`No mission ${payload.missionId}.`);
		error.code = "mission_not_found";
		throw error;
	}
	const actor = payload.actor || mission.assignee || "unknown";
	const denied = Model.authorize(mission, actor, "mutate");
	if (denied) {
		const error = new Error(`Actor ${actor} may not complete mission ${mission.missionId}.`);
		error.code = denied;
		throw error;
	}
	const openRequired = mission.checkpoints.filter(c => c.status !== "complete" && c.required !== false);
	if (openRequired.length && payload.force !== true) {
		const error = new Error(`${openRequired.length} required checkpoint(s) still open.`);
		error.code = "checkpoints_open";
		error.openCheckpoints = openRequired.map(c => c.checkpointId);
		throw error;
	}
	if (payload.summary) {
		mission.progress = { percent: 100, summary: Model.cleanText(payload.summary), updatedAt: Model.stamp() };
	} else {
		mission.progress.percent = 100;
	}
	mission.status = "complete";
	mission.completedAt = Model.stamp();
	mission.notes.push(Model.note({ by: actor, text: `Completed: ${mission.progress.summary || "(no summary)"}` }));
	await Store.saveMission(config, mission);
	await Store.activity(config, { kind: "mission_completed", missionId: mission.missionId, by: actor });
	// (8) Completion auto-spawns chained follow-ups.
	const spawned = await Chaining.fire(config, mission, actor);
	return { mission, spawned };
}

async function fail(config, payload = {}) {
	const mission = await Autopsy.record(config, payload);
	return { mission, autopsy: mission.autopsy };
}

module.exports = { pause, resume, complete, fail };
