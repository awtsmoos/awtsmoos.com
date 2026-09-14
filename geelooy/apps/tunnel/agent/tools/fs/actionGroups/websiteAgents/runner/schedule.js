//B"H
//Boruch Hashem
//Blessed be He

const Context = require("./context.js");
const { active } = Context.shared;
const run = Context.reference("run");
const terminalFailure = Context.reference("terminalFailure");
const clearWake = Context.reference("clearWake");

/**
 * @file Schedules one website mission while preserving its owning Tunnel configuration.
 * @description
 * Runner errors retain the exact project root needed to settle a dispatcher session;
 * the failure path therefore replaces only the disposable chat and never loses mission truth.
 */
function schedule(config, id) {
	if (active.has(id)) return active.get(id);
	clearWake(id);
	const promise = Promise.resolve()
		.then(() => run(config, id))
		.catch(error => terminalFailure(config, id, error))
		.finally(() => active.delete(id));
	active.set(id, promise);
	return promise;
}

Context.register("schedule", schedule);
module.exports = schedule;
