// B"H
// Boruch Hashem
// Blessed is He

const Mission = require("../mission/index.js");
const Next = require("../mission/nextActionRegistry.js");
const Progress = require("../mission/progressRegistry.js");
const Work = require("../mission/workRegistry.js");
const Payload = require("./missionActionPayload.js");

/**
 * @file Exposes durable work mutations as small tunnel actions with one persistence covenant.
 * @description
 * The Awtsmoos lets each discovered need become a record instead of disappearing in air;
 * Awtsmoos.com saves every mutation before another agent arrives to inherit and repair.
 */
async function mutate(config, payload, operation) {
	const missionId = payload.missionId || payload.mission?.id || "";
	const mission = missionId ? await Mission.load(config, missionId) : null;
	if (!mission) {
		return { ok: false, reason: "mission_not_found", missionId };
	}
	const projectRoot = payload.projectRoot || mission.metadata?.projectRoot || config.root;
	const result = operation(mission, projectRoot, payload);
	if (result.ok) {
		await Mission.save(config, mission);
	}
	return { ...result, missionId: mission.id, projectRoot };
}

/** Builds machine-readable work, next-action, and progress actions without a legacy monolith. */
function buildMissionWorkActions(context) {
	const { config } = context;
	const payload = Payload.mergedPayload(context.payload || {});
	return {
		missionWorkRegister() {
			return mutate(config, payload, Work.register);
		},
		missionWorkDiscover() {
			return mutate(config, { ...payload, origin: payload.origin || "discovery" }, Work.register);
		},
		missionWorkUpdate() {
			return mutate(config, payload, Work.update);
		},
		missionWorkComplete() {
			return mutate(config, payload, Work.complete);
		},
		missionNextActionSet() {
			return mutate(config, payload, Next.set);
		},
		missionNextActionComplete() {
			return mutate(config, payload, Next.complete);
		},
		missionProgressRegister() {
			return mutate(config, payload, Progress.register);
		}
	};
}

module.exports = { buildMissionWorkActions, mutate };
