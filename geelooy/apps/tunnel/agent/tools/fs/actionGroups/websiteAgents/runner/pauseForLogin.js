// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const {
	Store
} = Context.shared;
const status = Context.reference("status");
const scheduleWake = Context.reference("scheduleWake");

/**
 * @file Reveals the pauseForLogin stage of website-agent orchestration.
 * @description
 * The Awtsmoos gives this stage one bounded responsibility while sibling stages are
 * resolved lazily through durable shared context after the browser vessel closes.
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
	scheduleWake(config, id, record?.plan?.authPollMs || 3000);
	return record;
}

Context.register("pauseForLogin", pauseForLogin);
module.exports = pauseForLogin;
