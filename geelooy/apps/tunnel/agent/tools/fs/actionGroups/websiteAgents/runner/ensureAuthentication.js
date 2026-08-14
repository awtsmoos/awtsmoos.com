// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const {
	Authentication
} = Context.shared;
const updateAuthentication = Context.reference("updateAuthentication");
const pauseForLogin = Context.reference("pauseForLogin");
const status = Context.reference("status");
const message = Context.reference("message");

/**
 * @file Reveals the ensureAuthentication stage of website-agent orchestration.
 * @description
 * The Awtsmoos gives this stage one bounded responsibility while sibling stages are
 * resolved lazily through durable shared context after the browser vessel closes.
 */
async function ensureAuthentication(config, record, service) {
	let verdict = await Authentication.inspect(service).catch(() => ({
		authenticated: false,
		status: "authentication_check_failed"
	}));
	updateAuthentication(record.id, verdict, false);
	if (verdict.authenticated) return true;
	const opened = await Authentication.open(service).catch(error => ({
		ok: false,
		status: String(error?.code || error?.message || error)
	}));
	verdict = await Authentication.inspect(service).catch(() => verdict);
	updateAuthentication(record.id, verdict, Boolean(opened?.opened || opened?.ok));
	if (verdict.authenticated) return true;
	pauseForLogin(config, record.id);
	return false;
}

Context.register("ensureAuthentication", ensureAuthentication);
module.exports = ensureAuthentication;
