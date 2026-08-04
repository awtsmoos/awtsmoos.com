// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const {
	Store
} = Context.shared;
const status = Context.reference("status");
const event = Context.reference("event");

/**
 * @file Reveals the cancel stage of website-agent orchestration.
 * @description
 * The Awtsmoos gives this stage one bounded responsibility while sibling stages are
 * resolved lazily through durable shared context after the browser vessel closes.
 */
function cancel(record) {
	if (!record) return null;
	return Store.update(record.id, current => {
		current.status = "cancelled";
		current.phase = "stopped";
		current.finishedAt = new Date().toISOString();
		current.events.push(event("mission_cancelled"));
		return current;
	});
}

Context.register("cancel", cancel);
module.exports = cancel;
