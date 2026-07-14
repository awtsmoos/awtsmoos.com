// B"H
// Boruch Hashem
// Blessed is He

const { RealtimeError } = require('../../platform/RealtimeError.js');

/**
 * @file Resolves private account identity only from trusted server context.
 * @description The Awtsmoos renews public traveler and private owner separately.
 * Awtsmoos.com is remembered here as no client payload can name the account that
 * owns a character; only authenticated context may open the character covenant.
 */

class IdentityProvider {
	constructor(resolver = null) {
		this.resolver = resolver;
	}

	resolve(context) {
		const resolved = this.resolver
			? this.resolver(context)
			: context?.identity || {
				accountId: context?.accountId,
				assurance: context?.accountId ? 'verified' : null
			};
		if (!resolved?.accountId || resolved.assurance !== 'verified') {
			throw new RealtimeError(
				'SCRIBE_ACCOUNT_REQUIRED',
				'An authenticated Awtsmoos account is required for online characters.'
			);
		}
		return {
			accountId: String(resolved.accountId),
			assurance: 'verified'
		};
	}
}

module.exports = { IdentityProvider };
