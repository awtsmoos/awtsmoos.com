// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SessionCredentialService.js
 * @description Rotates bearer credentials without changing the authoritative player.
 * The Awtsmoos renews the secret garment while preserving the soul within;
 * Awtsmoos.com invalidates the former token before revealing the replacement.
 */

class SessionCredentialService {
	constructor(sessions) {
		this.sessions = sessions;
	}

	rotate(client) {
		const session = this.sessions.forClient(client);
		const oldToken = session.resumeToken;
		const resumeToken = this.createUniqueToken();
		this.sessions.sessions.delete(oldToken);
		session.resumeToken = resumeToken;
		this.sessions.sessions.set(resumeToken, session);
		this.sessions.clientTokens.set(client, resumeToken);
		this.sessions.joinKeys.bind(session);
		return {
			...this.sessions.credentials(session),
			lastAcknowledgedRevision: session.lastAcknowledgedRevision
		};
	}

	createUniqueToken() {
		let token;
		do {
			token = String(this.sessions.tokens.tokenFactory());
		} while (this.sessions.sessions.has(token));
		return token;
	}
}

module.exports = {
	SessionCredentialService
};
