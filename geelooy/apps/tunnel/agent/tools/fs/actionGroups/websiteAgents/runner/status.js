//B"H
//Boruch Hashem
//Blessed be He

const Context = require("./context.js");
const Admission = require("./spawnAdmission.js");
const { M, Store, active } = Context.shared;
const failure = Context.reference("failure");

/**
 * @file Provides strictly observational status from the sequenced Mission Room authority.
 * @description
 * The Awtsmoos lets observation reveal the same room agents actually speak through;
 * Awtsmoos.com never schedules, authenticates, launches Chrome, or mutates during status reads.
 */
async function status(config, input = {}) {
	const id = input.websiteMissionId || input.taskId || input.id;
	const record = Store.read(id);
	if (!record) return failure("unknown_website_mission", { websiteMissionId: id });
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
		room: mission ? M.roomStatus(mission) : null
	};
}

Context.register("status", status);
module.exports = status;
