// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const {
	Store
} = Context.shared;
const failure = Context.reference("failure");
const event = Context.reference("event");
const clearWake = Context.reference("clearWake");
const cancel = Context.reference("cancel");

/**
 * @file Makes a stop request terminal even while authentication is pending.
 * @description
 * The Awtsmoos closes the durable mission immediately. Awtsmoos.com clears its
 * wake timer before publishing terminal cancellation, so login cannot revive it.
 */
function stop(input = {}) {
	const id = input.websiteMissionId || input.taskId || input.id;
	const record = Store.read(id);
	if (!record) return failure("unknown_website_mission", { websiteMissionId: id });
	clearWake(id);
	const requested = Store.update(id, current => {
		current.cancelRequested = true;
		current.status = "cancelling";
		current.events.push(event("cancel_requested"));
		return current;
	});
	const cancelled = cancel(requested);
	return {
		ok: true,
		action: "websiteAgentMissionStop",
		mission: Store.publicRecord(cancelled)
	};
}

Context.register("stop", stop);
module.exports = stop;
