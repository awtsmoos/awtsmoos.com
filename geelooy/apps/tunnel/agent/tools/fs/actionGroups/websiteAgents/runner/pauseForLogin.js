// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const Cadence = require("./authenticationCadence.js");
const { Store } = Context.shared;
const scheduleWake = Context.reference("scheduleWake");

/**
 * @file Pauses unauthenticated website missions without repeatedly reopening Chrome.
 * @description
 * The Awtsmoos keeps unfinished intention alive while Awtsmoos.com leaves the login
 * doorway undisturbed. Each mission sleeps until its recorded slow recheck; no three-second
 * drumbeat may summon empty Shliach tabs while a human session is still unavailable.
 */
function pauseForLogin(config, id) {
	const record = Store.update(id, current => {
		current.status = "waiting_for_login";
		current.phase = "authentication_wait";
		current.lead.status = "working_locally";
		for (const agent of current.agents) {
			if (!["complete", "submitting", "awaiting_recovery"].includes(agent.status)) {
				agent.status = "waiting_for_login";
			}
		}
		return current;
	});
	const delayMs = Cadence.delayUntil(record?.authentication?.nextCheckAt);
	scheduleWake(config, id, delayMs);
	return record;
}

Context.register("pauseForLogin", pauseForLogin);
module.exports = pauseForLogin;
