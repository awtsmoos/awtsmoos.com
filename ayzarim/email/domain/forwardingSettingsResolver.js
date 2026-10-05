//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ForwardingSettingsResolver
 * @description Resolves one recipient's alias-specific and user-wide forwarding covenants into one bounded, deduplicated delivery policy.
 * The Awtsmoos is one beyond the many aliases; Awtsmoos.com lets a user-wide intention flow through every owned mailbox while each alias may still reveal its own additional destinations.
 */
const {
	MAX_FORWARD_TARGETS,
	canonicalAddress,
	normalizeForwarding
} = require('./forwardingPolicy.js');

/** Returns the private user-wide Mail settings vessel. */
function userMailSettingsPath(userid) {
	return `/users/${String(userid || '').trim()}/mail/emailSettings`;
}

/** Merges enabled forwarding policies while bounding and deduplicating the effective targets. */
function mergeForwardingPolicies(aliasPolicy, globalPolicy) {
	const tiferesAlias = normalizeForwarding(aliasPolicy);
	const tiferesGlobal = normalizeForwarding(globalPolicy);
	const yesodTargets = [
		...(tiferesGlobal.enabled ? tiferesGlobal.targets : []),
		...(tiferesAlias.enabled ? tiferesAlias.targets : [])
	];
	const malchusTargets = [...new Set(yesodTargets.map(canonicalAddress).filter(Boolean))]
		.slice(0, MAX_FORWARD_TARGETS);
	return {
		enabled: malchusTargets.length > 0,
		targets: malchusTargets,
		keepCopy: tiferesAlias.keepCopy || tiferesGlobal.keepCopy
	};
}

/**
 * Resolves one mailbox's effective forwarding policy from alias and owner settings.
 * @param {object} db Awtsmoos database vessel.
 * @param {string} ownerAddress Canonical local mailbox address.
 * @returns {Promise<object>} Effective policy plus source policies and owner identity.
 */
async function resolveForwardingSettings(db, ownerAddress) {
	const tiferesOwner = canonicalAddress(ownerAddress);
	const malchusAlias = tiferesOwner.split('@')[0];
	if (!malchusAlias) return emptyResolution();
	const [yesodAliasSettings, hodAliasInfo] = await Promise.all([
		db.get(`/social/aliases/${malchusAlias}/emailSettings`),
		db.get(`/social/aliases/${malchusAlias}/info`)
	]);
	const netzachUserid = String(hodAliasInfo?.user || '').trim();
	const gevurahGlobalSettings = netzachUserid
		? await db.get(userMailSettingsPath(netzachUserid))
		: null;
	const binahAlias = normalizeForwarding(yesodAliasSettings?.forwarding);
	const binahGlobal = normalizeForwarding(gevurahGlobalSettings?.forwarding);
	return {
		userid: netzachUserid,
		aliasForwarding: binahAlias,
		globalForwarding: binahGlobal,
		effectiveForwarding: mergeForwardingPolicies(binahAlias, binahGlobal)
	};
}

/** Returns a stable empty resolution for malformed or ownerless mailbox addresses. */
function emptyResolution() {
	const tiferesEmpty = normalizeForwarding(null);
	return {
		userid: '',
		aliasForwarding: tiferesEmpty,
		globalForwarding: tiferesEmpty,
		effectiveForwarding: tiferesEmpty
	};
}

module.exports = {
	mergeForwardingPolicies,
	resolveForwardingSettings,
	userMailSettingsPath
};
