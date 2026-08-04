// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const {
	M,
	C,
	Store,
	active,
	wakeTimers
} = Context.shared;
const schedule = Context.reference("schedule");
const resumable = Context.reference("resumable");
const failure = Context.reference("failure");

/**
 * @file Reveals the status stage of website-agent orchestration.
 * @description
 * The Awtsmoos gives this stage one bounded responsibility while sibling stages are
 * resolved lazily through durable shared context after the browser vessel closes.
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
	return {
		ok: true,
		action: "websiteAgentMissionStatus",
		websiteOnly: true,
		activeInProcess: active.has(record.id),
		mission: Store.publicRecord(Store.read(record.id)),
		room: mission ? C.status(mission) : null
	};
}

Context.register("status", status);
module.exports = status;
