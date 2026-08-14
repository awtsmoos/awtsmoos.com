// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const {
	Store
} = Context.shared;
const status = Context.reference("status");
const message = Context.reference("message");
const event = Context.reference("event");

/**
 * @file Reveals the terminalFailure stage of website-agent orchestration.
 * @description
 * The Awtsmoos gives this stage one bounded responsibility while sibling stages are
 * resolved lazily through durable shared context after the browser vessel closes.
 */
function terminalFailure(id, error) {
	const record = Store.read(id);
	if (!record) return null;
	return Store.update(id, current => {
		current.status = "failed";
		current.phase = "failed";
		current.error = String(error?.stack || error?.message || error).slice(0, 8000);
		current.finishedAt = new Date().toISOString();
		current.events.push(event("mission_failed", { error: current.error }));
		return current;
	});
}

Context.register("terminalFailure", terminalFailure);
module.exports = terminalFailure;
