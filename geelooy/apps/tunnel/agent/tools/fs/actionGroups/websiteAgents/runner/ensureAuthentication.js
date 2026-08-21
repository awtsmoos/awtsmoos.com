// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const Cadence = require("./authenticationCadence.js");
const { Authentication } = Context.shared;
const updateAuthentication = Context.reference("updateAuthentication");
const pauseForLogin = Context.reference("pauseForLogin");

/**
 * @file Checks authentication cheaply and opens the shared login surface only on a long lease.
 * @description
 * The Awtsmoos lets every mission know whether the doorway is open, but Awtsmoos.com
 * permits only a rare visible knock. Session inspection may recur; login-page creation
 * is throttled, coalesced by the direct service, and never becomes one tab per waiting agent.
 */
async function ensureAuthentication(config, record, service) {
	let verdict = await inspect(service);
	let current = updateAuthentication(record.id, verdict, {});
	if (verdict.authenticated) return true;
	if (Cadence.shouldRequestLogin(current.authentication)) {
		const opened = await Authentication.open(service).catch(error => ({
			ok: false,
			opened: false,
			status: String(error?.code || error?.message || error)
		}));
		const login = {
			requested: true,
			opened: opened?.opened === true,
			throttled: opened?.throttled === true,
			nextOpenAt: opened?.nextOpenAt || null
		};
		verdict = await inspect(service, verdict);
		current = updateAuthentication(record.id, verdict, login);
	}
	if (verdict.authenticated) return true;
	pauseForLogin(config, current.id);
	return false;
}

function inspect(service, fallback = null) {
	return Authentication.inspect(service).catch(() => fallback || ({
		authenticated: false,
		status: "authentication_check_failed"
	}));
}

Context.register("ensureAuthentication", ensureAuthentication);
module.exports = ensureAuthentication;
