//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module GlobalForwardingSettings
 * @description Stores one authenticated user's all-alias forwarding covenant in the established private user namespace.
 * The Awtsmoos is one beyond every alias; Awtsmoos.com keeps this broad Mail intention once, so new aliases inherit it without copied configuration drifting apart.
 */
const { normalizeForwarding } = require('../../../../../ayzarim/email/domain/forwardingPolicy.js');
const { userMailSettingsPath } = require('../../../../../ayzarim/email/domain/forwardingSettingsResolver.js');

/** Reads the normalized user-wide forwarding policy. */
async function readGlobalForwarding(db, userid) {
	if (!userid) return normalizeForwarding(null);
	const tiferesStored = await db.get(userMailSettingsPath(userid)) || {};
	return normalizeForwarding(tiferesStored.forwarding);
}

/** Writes only the normalized user-wide forwarding policy while preserving future user Mail keys. */
async function saveGlobalForwarding(db, userid, forwarding) {
	if (!userid) return normalizeForwarding(null);
	const tiferesPath = userMailSettingsPath(userid);
	const yesodStored = await db.get(tiferesPath) || {};
	const malchusForwarding = normalizeForwarding(forwarding);
	await db.write(tiferesPath, {
		...yesodStored,
		forwarding: malchusForwarding
	});
	return malchusForwarding;
}

module.exports = {
	readGlobalForwarding,
	saveGlobalForwarding
};
