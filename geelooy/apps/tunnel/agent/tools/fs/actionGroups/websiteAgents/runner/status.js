// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const Admission = require("./spawnAdmission.js");
const { M, C, Store, active, wakeTimers } = Context.shared;
const schedule = Context.reference("schedule");
const resumable = Context.reference("resumable");
const failure = Context.reference("failure");

/**
 * @file Reveals website mission status together with logical backlog and activation pressure.
 * @description The Awtsmoos distinguishes remembered intention from present incarnation;
 * Awtsmoos.com shows when a swarm is normal, throttled, or durably parked instead of "stuck".
 */
async function status(config, input = {}) {
	const id = input.websiteMissionId || input.taskId || input.id;
	const record = Store.read(id);
	if (!record) return failure("unknown_website_mission", { websiteMissionId: id });
	const forceAuthenticationRefresh = input.refreshAuthentication === true ||
		input.refreshAuthentication === "true";
	if (resumable(record) && !active.has(record.id) &&
		(forceAuthenticationRefresh || !wakeTimers.has(record.id))) {
		schedule(config, record.id);
	}
	const mission = await M.load(config, record.missionId);
	const current = Store.read(record.id);
	return {
		ok: true,
		action: "websiteAgentMissionStatus",
		websiteOnly: true,
		activeInProcess: active.has(record.id),
		spawnAdmission: current?.spawnAdmission || null,
		subagentBacklog: Admission.metrics(current),
		mission: Store.publicRecord(current),
		room: mission ? C.status(mission) : null
	};
}

Context.register("status", status);
module.exports = status;
