// B"H

const Mission = require("../index.js");
const Lock = require("../lock/index.js");
const Normalize = require("./normalize.js");

function missionId(config, payload = {}) {
	return String(payload.missionId || payload.id || payload.target || Lock.active(config)?.missionId || "");
}

async function read(config, payload = {}) {
	const id = missionId(config, payload);
	if (!id) return { ok: false, error: "missing_mission_id", missionId: "" };
	const mission = await Mission.load(config, id);
	if (!mission) return { ok: false, error: "mission_not_found", missionId: id };
	const control = Normalize.normalize(mission.continuationControl || {});
	return { ok: true, missionId: id, mission, control };
}

async function mutate(config, payload = {}, mutation = control => control, options = {}) {
	const current = await read(config, payload);
	if (!current.ok) return current;
	const expectedRevision = payload.expectedRevision ?? payload.revision;
	if (expectedRevision !== undefined && Number(expectedRevision) !== current.control.revision) {
		return {
			ok: false,
			error: "continuation_revision_conflict",
			missionId: current.missionId,
			expectedRevision: Number(expectedRevision),
			control: current.control
		};
	}
	const changed = mutation({ ...current.control }) || current.control;
	const now = new Date().toISOString();
	const runtime = Boolean(options.runtime);
	const control = Normalize.normalize({
		...changed,
		revision: current.control.revision + (runtime ? 0 : 1),
		runtimeRevision: current.control.runtimeRevision + (runtime ? 1 : 0),
		lastActor: runtime
			? current.control.lastActor
			: payload.actor || payload.agentId || payload.logicalAgentId || "control-room",
		lastReason: runtime
			? changed.lastReason
			: payload.reason || changed.lastReason || null,
		policyUpdatedAt: runtime ? current.control.policyUpdatedAt : now,
		runtimeUpdatedAt: runtime ? now : current.control.runtimeUpdatedAt,
		updatedAt: now
	}, current.control, now);
	current.mission.continuationControl = control;
	await Mission.save(config, current.mission);
	return { ok: true, missionId: current.missionId, mission: current.mission, control };
}

async function patch(config, payload = {}) {
	const input = payload.policy && typeof payload.policy === "object"
		? payload.policy
		: payload;
	return mutate(config, payload, control => Normalize.normalize(input, control));
}

module.exports = { missionId, mutate, patch, read };
