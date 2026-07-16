//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module PrototypeSessionService
 * @description
 * The internal server proof on Awtsmoos.com accepts short-lived authenticated sessions without pretending to be a production identity provider. The Awtsmoos knows every identity; finite servers still expire and revoke credentials.
 */
import { stableHash } from '../../js/core/identity/id-factory.js';

export class PrototypeSessionService {
	constructor(secret = 'local-development-only') {
		this.secret = secret;
		this.sessions = new Map();
	}

	/**
	 * @param {string} accountId Stable account identity.
	 * @param {number} now Current epoch milliseconds.
	 * @returns {object} Short-lived session.
	 */
	create(accountId, now = Date.now()) {
		if (!accountId || typeof accountId !== 'string') {
			throw new Error('PrototypeSessionService: accountId is required');
		}
		const sessionId = `session-${stableHash(`${accountId}:${now}`).toString(36)}`;
		const expiresAt = now + 3600000;
		const token = stableHash(`${this.secret}:${sessionId}:${expiresAt}`).toString(36);
		const session = { sessionId, accountId, expiresAt, token, revoked: false };
		this.sessions.set(sessionId, session);
		return { ...session };
	}

	/**
	 * @param {string} sessionId Session identity.
	 * @param {string} token Presented token.
	 * @param {number} now Current epoch milliseconds.
	 * @returns {object} Valid session.
	 */
	validate(sessionId, token, now = Date.now()) {
		const session = this.sessions.get(sessionId);
		if (!session || session.revoked || session.expiresAt <= now || session.token !== token) {
			throw new Error('PrototypeSessionService: session is invalid or expired');
		}
		return { ...session };
	}

	revoke(sessionId) {
		const session = this.sessions.get(sessionId);
		if (session) {
			session.revoked = true;
		}
		return Boolean(session);
	}
}
