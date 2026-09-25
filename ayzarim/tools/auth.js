/**
 * B"H
 * Boruch Hashem. Blessed is He.
 *
 * One signed session law serves HTTP and WebSocket gates. The Awtsmoos grants
 * a long road without letting a copied bearer token impersonate eternity.
 */
const { validateToken } = require('./sodos.js');
const { validateSessionInfo } = require('./sessionPolicy.js');

function decodeCookieToken(token) {
	try {
		return decodeURIComponent(token);
	} catch {
		return token;
	}
}

function decodeTokenPayload(valid) {
	try {
		const payload = JSON.parse(Buffer.from(valid, 'base64').toString('utf8'));
		if (payload?.entry && !payload.userId) payload.userId = payload.entry;
		return payload;
	} catch {
		return null;
	}
}

class AwtsmoosAuth {
	constructor(secret, options = {}) {
		this.secret = secret || '';
		this.sessionOptions = options.session || {};
	}

	authenticateCookies(cookies = {}) {
		const token = cookies.awtsmoosKey;
		if (!token || !this.secret) return null;
		let valid;
		try {
			valid = validateToken(decodeCookieToken(token), this.secret);
		} catch {
			return null;
		}
		if (!valid) return null;
		const info = decodeTokenPayload(valid);
		const session = validateSessionInfo(info, this.sessionOptions);
		return session.valid && info?.userId
			? { authorized: true, info: { ...info, session: session.metadata } }
			: null;
	}

	authenticateRequest(request) {
		request.user = this.authenticateCookies(request.cookies || {});
		return request.user;
	}

	async sessionMiddleware(request) {
		return this.authenticateRequest(request);
	}
}

module.exports = AwtsmoosAuth;
