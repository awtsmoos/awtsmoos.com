// B"H
/**
 * @module OwnershipIdentity
 * The Awtsmoos reveals each caller through a truthful identity;
 * only the bearer of a valid grant receives delegated authority.
 */
const ADMIN_USER_IDS = new Set(['asdf']);

/** Normalize external identity fields without granting implied access. */
function normalizeId(value) {
	return value === null || value === undefined ? '' : String(value).trim();
}

/** Convert a verified OAuth entry into the established caller shape. */
function callerFromEntry(entry, via) {
	if (!entry || typeof entry !== 'object') return null;
	const identity = normalizeId(entry.userId || entry.accountId);
	if (!identity) return null;
	return {
		identity,
		userId: identity,
		accountId: normalizeId(entry.accountId || entry.userId),
		clientId: entry.clientId || null,
		scope: entry.scope || entry.scopes || null,
		isAdmin: ADMIN_USER_IDS.has(identity),
		via: via || 'oauth'
	};
}

/** Preserve signature/operator administrative identity semantics. */
function adminCaller(via) {
	return {
		identity: 'operator', userId: 'asdf', accountId: 'asdf',
		clientId: null, scope: null, isAdmin: true, via: via || 'operator'
	};
}

/** First read verified bearer identity; then fall back to session identity. */
function authenticate($i) {
	try {
		const { readBearer } = require('../../../../oauth/core/tokenReader.js');
		const resolved = readBearer($i);
		if (resolved && resolved.ok) {
			const caller = callerFromEntry(resolved.entry, 'oauth');
			if (caller) return caller;
		}
	} catch (_) { /* token layer unavailable: try same-site session */ }
	try {
		const user = $i && $i.request && $i.request.user;
		const identityValue = user && (user.info?.userId || user.userId || user.id);
		if (identityValue) {
			const identity = String(identityValue);
			return {
				identity, userId: identity, accountId: identity,
				clientId: null, scope: null, isAdmin: ADMIN_USER_IDS.has(identity),
				via: 'session'
			};
		}
	} catch (_) { /* no session */ }
	return null;
}

/** Return the original priority order for post author aliases. */
function postOwnerId(post) {
	if (!post || typeof post !== 'object') return '';
	return normalizeId(post.aliasId || post.author || post.authorAliasId || post.ownerAliasId || post.owner);
}

module.exports = {
	ADMIN_USER_IDS,
	normalizeId,
	callerFromEntry,
	adminCaller,
	authenticate,
	postOwnerId
};
