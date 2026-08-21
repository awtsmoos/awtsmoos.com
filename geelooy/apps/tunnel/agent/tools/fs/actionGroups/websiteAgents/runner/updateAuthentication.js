// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const Cadence = require("./authenticationCadence.js");
const { Store } = Context.shared;
const event = Context.reference("event");

/**
 * @file Persists authentication truth and exponential retry cadence for one website mission.
 * @description
 * The Awtsmoos lets a login failure become quiet knowledge rather than repeated browser noise.
 * Awtsmoos.com remembers attempts, failures, and the next safe recheck while successful
 * authentication erases the backoff and releases the waiting shliach into its real mission.
 */
function updateAuthentication(id, verdict = {}, login = {}) {
	return Store.update(id, record => {
		const previous = record.authentication || {};
		const authenticated = verdict.authenticated === true;
		const failureCount = authenticated ? 0 : Number(previous.failureCount || 0) + 1;
		const now = Date.now();
		const delayMs = authenticated ? 0 : Cadence.nextDelay({ failureCount });
		record.authentication = {
			...previous,
			status: authenticated ? "authenticated" : String(verdict.status || "login_required"),
			failureCount,
			loginOpened: previous.loginOpened || login.opened === true,
			loginThrottled: login.throttled === true,
			lastCheckedAt: new Date(now).toISOString(),
			lastLoginRequestedAt: login.requested
				? new Date(now).toISOString()
				: previous.lastLoginRequestedAt || null,
			nextLoginOpenAt: login.nextOpenAt || previous.nextLoginOpenAt || null,
			nextCheckAt: authenticated ? null : new Date(now + delayMs).toISOString()
		};
		record.events.push(event(authenticated ? "authentication_ready" : "authentication_waiting", {
			status: record.authentication.status,
			failureCount,
			loginOpened: login.opened === true,
			loginThrottled: login.throttled === true,
			nextCheckAt: record.authentication.nextCheckAt,
			leadContinuesLocally: !authenticated
		}));
		return record;
	});
}

Context.register("updateAuthentication", updateAuthentication);
module.exports = updateAuthentication;
