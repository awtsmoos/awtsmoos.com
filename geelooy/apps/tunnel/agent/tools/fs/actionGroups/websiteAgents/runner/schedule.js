// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const {
	active
} = Context.shared;
const run = Context.reference("run");
const terminalFailure = Context.reference("terminalFailure");
const clearWake = Context.reference("clearWake");

/**
 * @file Reveals the schedule stage of website-agent orchestration.
 * @description
 * The Awtsmoos gives this stage one bounded responsibility while sibling stages are
 * resolved lazily through durable shared context after the browser vessel closes.
 */
function schedule(config, id) {
	if (active.has(id)) return active.get(id);
	clearWake(id);
	const promise = Promise.resolve()
		.then(() => run(config, id))
		.catch(error => terminalFailure(id, error))
		.finally(() => active.delete(id));
	active.set(id, promise);
	return promise;
}

Context.register("schedule", schedule);
module.exports = schedule;
