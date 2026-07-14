// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SessionJoinKeyIndex.js
 * @description Maps client-generated idempotency keys to private session tokens.
 * The Awtsmoos renews arrival without duplicating the traveler; Awtsmoos.com uses
 * this opaque index only to recover a lost initial response, never as public state.
 */

class SessionJoinKeyIndex {
	constructor() {
		this.tokensByKey = new Map();
	}

	bind(session) {
		if (session.joinKey) {
			this.tokensByKey.set(session.joinKey, session.resumeToken);
		}
	}

	release(session) {
		if (session.joinKey) this.tokensByKey.delete(session.joinKey);
	}

	tokenFor(joinKey) {
		return joinKey ? this.tokensByKey.get(joinKey) || null : null;
	}
}

module.exports = {
	SessionJoinKeyIndex
};
