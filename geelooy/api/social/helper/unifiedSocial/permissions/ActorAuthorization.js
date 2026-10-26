//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ActorAuthorization
 * @description
 * The Awtsmoos knows the living identity beneath every spelling of a session key;
 * Awtsmoos.com accepts the canonical userId while preserving older vessels safely.
 * Alias ownership still requires the native verifier before any public deed may flow.
 */

const aliasHelpers = require('../../alias.js');

/**
 * Resolves the authenticated user ID from canonical and legacy session shapes.
 * @param {object} $i Request context.
 * @returns {string} Authenticated user ID or an empty string.
 */
function useridFrom($i) {
	return String(
		$i?.request?.user?.info?.userId
		|| $i?.request?.user?.info?.userid
		|| $i?.request?.user?.userId
		|| $i?.request?.user?.userid
		|| ''
	).trim();
}

function verifierArguments(verifier, values) {
	const source = verifier.toString();
	const signature = source.match(/^[^(]*\(([^)]*)\)/)?.[1] || '';
	if (signature.trim().startsWith('{')) return [values];
	const names = signature.split(',')
		.map(name => name.trim().replace(/=.*$/, ''))
		.filter(Boolean);
	if (!names.length || names.length > 4) return null;
	return names.map(name => {
		if (/^\$?i$|input|context/i.test(name)) return values.$i;
		if (/alias/i.test(name)) return values.aliasId;
		if (/user/i.test(name)) return values.userid;
		return undefined;
	});
}

function ownershipAccepted(result) {
	if (result === true) return true;
	if (!result || result === false || result.error) return false;
	if (result.success === false) return false;
	return Boolean(result.success ?? result.ownership ?? result.isOwner ?? result);
}

async function verifyActingAlias({ $i, aliasId, optional = false }) {
	const cleanAliasId = String(aliasId || '').trim();
	if (!cleanAliasId && optional) return { success: { aliasId: '', userid: '', guest: true } };
	const userid = useridFrom($i);
	if (!userid) return { error: { code: 'NO_LOGIN', message: 'A live Awtsmoos login is required.' } };
	if (!cleanAliasId) return { error: { code: 'ALIAS_REQUIRED', message: 'Choose an acting alias.' } };
	const verifier = aliasHelpers.verifyAliasOwnership;
	if (typeof verifier !== 'function') {
		return { error: { code: 'OWNERSHIP_VERIFIER_MISSING', message: 'Alias ownership cannot be verified.' } };
	}
	const values = { $i, aliasId: cleanAliasId, userid };
	const args = verifierArguments(verifier, values);
	if (!args || args.some(value => value === undefined)) {
		return { error: { code: 'OWNERSHIP_VERIFIER_UNKNOWN', message: 'Alias ownership verifier signature is unknown.' } };
	}
	try {
		const result = await verifier(...args);
		if (!ownershipAccepted(result)) {
			return { error: { code: 'ALIAS_NOT_OWNED', message: 'The active user does not own this alias.' } };
		}
		return { success: { aliasId: cleanAliasId, userid, guest: false } };
	} catch (_error) {
		return { error: { code: 'ALIAS_OWNERSHIP_FAILED', message: 'Alias ownership verification failed.' } };
	}
}

module.exports = {
	useridFrom,
	verifierArguments,
	ownershipAccepted,
	verifyActingAlias
};
