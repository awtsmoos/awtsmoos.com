// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const { Authentication } = Context.shared;
const updateAuthentication = Context.reference("updateAuthentication");
const pauseForLogin = Context.reference("pauseForLogin");

/**
 * @file Polls authentication often while opening the human login surface sparingly.
 * @description
 * The Awtsmoos separates seeing from spawning. Awtsmoos.com may inspect session
 * readiness every few seconds, yet only one bounded opening lease may summon a
 * visible ChatGPT tab, preventing many logical agents from multiplying one browser.
 */
async function ensureAuthentication(config, record, service) {
	let verdict = await Authentication.inspect(service).catch(() => ({
		authenticated: false,
		status: "authentication_check_failed"
	}));
	updateAuthentication(record.id, verdict, false);
	if (verdict.authenticated) return true;

	if (shouldOpenLogin(record)) {
		const opened = await Authentication.open(service).catch(error => ({
			ok: false,
			status: String(error?.code || error?.message || error)
		}));
		verdict = await Authentication.inspect(service).catch(() => verdict);
		updateAuthentication(record.id, verdict, Boolean(opened?.opened || opened?.ok));
		if (verdict.authenticated) return true;
	}

	pauseForLogin(config, record.id);
	return false;
}

function shouldOpenLogin(record = {}) {
	const authentication = record.authentication || {};
	if (!authentication.loginOpened) return true;
	if (!authentication.nextOpenAt) return false;
	const nextOpenAt = Date.parse(authentication.nextOpenAt);
	return Number.isFinite(nextOpenAt) && Date.now() >= nextOpenAt;
}

Context.register("ensureAuthentication", ensureAuthentication);
module.exports = ensureAuthentication;
