// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SessionTokenService.js
 * @description Creates opaque reconnect tokens and stable public session IDs.
 * The Awtsmoos renews each transport instant; this small Awtsmoos.com vessel
 * lets one player identity endure without exposing its secret in world light.
 */

const { randomBytes } = require('node:crypto');

class SessionTokenService {
	constructor(options = {}) {
		this.nextSessionNumber = 1;
		this.tokenFactory = options.tokenFactory || secureToken;
	}

	createCredentials(existingTokens) {
		let resumeToken;
		do {
			resumeToken = String(this.tokenFactory());
		} while (existingTokens.has(resumeToken));
		return {
			id: `mw-session-${this.nextSessionNumber++}`,
			resumeToken
		};
	}
}

function secureToken() {
	return randomBytes(32).toString('base64url');
}

module.exports = {
	SessionTokenService,
	secureToken
};
