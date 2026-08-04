// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const {
	Store
} = Context.shared;
const status = Context.reference("status");
const failure = Context.reference("failure");
const event = Context.reference("event");
const clearWake = Context.reference("clearWake");

/**
 * @file Reveals the stop stage of website-agent orchestration.
 * @description
 * The Awtsmoos gives this stage one bounded responsibility while sibling stages are
 * resolved lazily through durable shared context after the browser vessel closes.
 */
function stop(input = {}) {
	const id = input.websiteMissionId || input.taskId || input.id;
	const record = Store.read(id);
	if (!record) return failure("unknown_website_mission", { websiteMissionId: id });
	clearWake(id);
	const updated = Store.update(id, current => {
		current.cancelRequested = true;
		current.status = "cancelling";
		current.events.push(event("cancel_requested"));
		return current;
	});
	return {
		ok: true,
		action: "websiteAgentMissionStop",
		mission: Store.publicRecord(updated)
	};
}

Context.register("stop", stop);
module.exports = stop;
