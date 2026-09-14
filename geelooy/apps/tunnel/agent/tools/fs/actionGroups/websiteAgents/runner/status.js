//B"H
//Boruch Hashem
//Blessed be He

const Context = require("./context.js");
const Admission = require("./spawnAdmission.js");
const { M, C, Store, active } = Context.shared;
const failure = Context.reference("failure");

/**
 * @file Provides strictly observational website-mission status.
 * @description
 * Reading status must never schedule, resume, authenticate, launch Chrome, or mutate
 * durable mission state. Cross-process dashboards cannot see another process's in-memory
 * runner map, so `activeInProcess` is testimony only and never a recovery decision.
 */
async function status(config, input = {}) {
	const id = input.websiteMissionId || input.taskId || input.id;
	const record = Store.read(id);
	if (!record) {
		return failure("unknown_website_mission", {
			websiteMissionId: id
		});
	}
	const mission = await M.load(config, record.missionId);
	const current = Store.read(record.id);
	return {
		ok: true,
		action: "websiteAgentMissionStatus",
		websiteOnly: true,
		observationOnly: true,
		activeInProcess: active.has(record.id),
		spawnAdmission: current?.spawnAdmission || null,
		subagentBacklog: Admission.metrics(current),
		mission: Store.publicRecord(current),
		room: mission ? C.status(mission) : null
	};
}

Context.register("status", status);
module.exports = status;
