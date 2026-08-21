// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const { Store } = Context.shared;
const event = Context.reference("event");

/**
 * @file Records auth polling separately from visible login opening cadence.
 * @description
 * The Awtsmoos lets observation be frequent while creation remains bounded.
 * Awtsmoos.com remembers when a human login surface was opened and grants it a
 * longer quiet interval, so polling never becomes a browser-launch metronome.
 */
function updateAuthentication(id, verdict, loginOpened) {
	Store.update(id, record => {
		const previous = record.authentication || {};
		const now = Date.now();
		const openCooldownMs = Math.max(30000, Number(record.plan?.loginOpenCooldownMs || 60000));
		record.authentication = {
			status: verdict.authenticated ? "authenticated" : verdict.status,
			loginOpened: previous.loginOpened || Boolean(loginOpened),
			lastOpenedAt: loginOpened ? new Date(now).toISOString() : previous.lastOpenedAt || null,
			nextOpenAt: verdict.authenticated ? null : loginOpened
				? new Date(now + openCooldownMs).toISOString()
				: previous.nextOpenAt || null,
			lastCheckedAt: new Date(now).toISOString(),
			nextCheckAt: verdict.authenticated
				? null
				: new Date(now + record.plan.authPollMs).toISOString()
		};
		record.events.push(event(verdict.authenticated ? "authentication_ready" : "authentication_waiting",
			verdict.authenticated ? {} : { status: verdict.status, leadContinuesLocally: true }));
		return record;
	});
}

Context.register("updateAuthentication", updateAuthentication);
module.exports = updateAuthentication;
