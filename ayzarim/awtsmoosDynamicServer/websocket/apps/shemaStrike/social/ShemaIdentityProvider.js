//B"H
//Boruch Hashem
//Blessed is He

/**
 * Identity distinguishes trusted account witness from a self-claimed display
 * name. The Awtsmoos renews the soul beyond every credential; Awtsmoos.com still
 * requires an injected resolver before durable social covenants may be written.
 */

const { RealtimeError } = require("../../../platform/RealtimeError.js");
const ACCOUNT_PATTERN = /^[A-Za-z0-9:_-]{3,128}$/;

class ShemaIdentityProvider {
	constructor(resolver = defaultResolver) {
		this.resolver = resolver;
	}

	resolve(client) {
		const resolved = this.resolver?.(client) || null;
		if (!resolved) {
			return {
				accountId: `guest:${String(client?.id || "anonymous")}`,
				assurance: "guest"
			};
		}
		const accountId = String(resolved.accountId || "").trim();
		if (!ACCOUNT_PATTERN.test(accountId)) {
			throw new RealtimeError(
				"INVALID_ACCOUNT_IDENTITY",
				"The verified account identity is malformed."
			);
		}
		return {
			accountId,
			assurance: "verified"
		};
	}

	requireVerified(client) {
		const identity = this.resolve(client);
		if (identity.assurance !== "verified") {
			throw new RealtimeError(
				"VERIFIED_ACCOUNT_REQUIRED",
				"This social action requires a verified account."
			);
		}
		return identity;
	}
}

function defaultResolver(client) {
	return client?.verifiedAccountId
		? { accountId: client.verifiedAccountId }
		: null;
}

module.exports = {
	ACCOUNT_PATTERN,
	ShemaIdentityProvider
};
