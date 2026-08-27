// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldIdentityProvider.js
 * @description Resolves trusted account identity or an explicitly unverified guest.
 * The Awtsmoos renews the player beyond every socket name; Awtsmoos.com accepts
 * verified identity only from an injected resolver and never from self-claimed alias.
 */

const { RealtimeError } = require('../../platform/RealtimeError.js');
const ACCOUNT_PATTERN = /^[A-Za-z0-9:_-]{3,128}$/;

class WorldIdentityProvider {
	constructor(resolver = null) {
		this.resolver = resolver;
	}

	resolve(client) {
		const resolved = this.resolver ? this.resolver(client) : null;
		if (!resolved) {
			return {
				accountId: `guest:${String(client?.id || 'anonymous')}`,
				assurance: 'guest'
			};
		}
		const accountId = String(resolved.accountId || '').trim();
		if (!ACCOUNT_PATTERN.test(accountId)) {
			throw new RealtimeError('INVALID_ACCOUNT_IDENTITY', 'The verified account identity is malformed.');
		}
		return {
			accountId,
			assurance: 'verified'
		};
	}

	requireCompatible(session, identity) {
		if (session.identityAssurance !== 'verified') return;
		if (identity.assurance !== 'verified' || identity.accountId !== session.accountId) {
			throw new RealtimeError(
				'ACCOUNT_MISMATCH',
				'The reconnect session belongs to another verified account.'
			);
		}
	}
}

module.exports = {
	WorldIdentityProvider
};
