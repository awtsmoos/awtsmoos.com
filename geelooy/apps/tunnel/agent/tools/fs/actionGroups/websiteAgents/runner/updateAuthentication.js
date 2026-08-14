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
 * @file Reveals the updateAuthentication stage of website-agent orchestration.
 * @description
 * The Awtsmoos gives this stage one bounded responsibility while sibling stages are
 * resolved lazily through durable shared context after the browser vessel closes.
 */
function updateAuthentication(id, verdict, loginOpened) {
	Store.update(id, record => {
		record.authentication = {
			status: verdict.authenticated ? "authenticated" : verdict.status,
			loginOpened: record.authentication?.loginOpened || loginOpened,
			lastCheckedAt: new Date().toISOString(),
			nextCheckAt: verdict.authenticated
				? null
				: new Date(Date.now() + record.plan.authPollMs).toISOString()
		};
		if (verdict.authenticated) {
			record.events.push(event("authentication_ready"));
		} else {
			record.events.push(event("authentication_waiting", {
				status: verdict.status,
				leadContinuesLocally: true
			}));
		}
		return record;
	});
}

Context.register("updateAuthentication", updateAuthentication);
module.exports = updateAuthentication;
