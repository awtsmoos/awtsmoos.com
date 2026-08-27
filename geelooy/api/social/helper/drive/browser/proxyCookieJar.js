//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ProxyCookieJar
 * @description
 * The Awtsmoos holds each remote browser memory inside its authenticated owner.
 * Awtsmoos.com exposes jar metadata and clearing operations, while cookie values
 * remain server-held and are emitted only when target cookie policy permits them.
 */

const { parseSetCookie, cookieCanSend } = require('./proxyCookiePolicy.js');

class ProxyCookieJarStore {
	constructor() {
		this.users = new Map();
	}

	cookieHeader({ userId, jarId, url, method, initiatorUrl, now = Date.now() }) {
		const jar = this.getJar(userId, jarId, false);
		if (!jar) return '';
		const cookies = [];
		for (const [key, cookie] of jar.cookies) {
			if (cookie.expiresAt !== null && cookie.expiresAt <= now) {
				jar.cookies.delete(key);
				continue;
			}
			if (!cookieCanSend(cookie, { url, method, initiatorUrl })) continue;
			cookies.push(`${cookie.name}=${cookie.value}`);
		}
		return cookies.join('; ');
	}

	storeResponseCookies({ userId, jarId, url, setCookie, now = Date.now() }) {
		const lines = Array.isArray(setCookie) ? setCookie : setCookie ? [setCookie] : [];
		if (!lines.length) return this.jarMetadata(userId, jarId);
		const jar = this.getJar(userId, jarId, true);
		for (const line of lines) {
			const cookie = parseSetCookie(line, url, now);
			if (!cookie) continue;
			const key = cookieKey(cookie);
			if (cookie.expiresAt !== null && cookie.expiresAt <= now) jar.cookies.delete(key);
			else jar.cookies.set(key, cookie);
		}
		return metadata(jar);
	}

	listJars(userId) {
		const user = this.users.get(requiredUser(userId));
		if (!user) return [];
		return [...user.values()].map(metadata);
	}

	clearJar(userId, jarId = 'default') {
		const user = this.users.get(requiredUser(userId));
		if (!user) return false;
		return user.delete(normalizeJarId(jarId));
	}

	jarMetadata(userId, jarId = 'default') {
		const jar = this.getJar(userId, jarId, false);
		return jar ? metadata(jar) : { id: normalizeJarId(jarId), cookieCount: 0, domains: [] };
	}

	getJar(userId, jarId = 'default', create = true) {
		const owner = requiredUser(userId);
		const id = normalizeJarId(jarId);
		let user = this.users.get(owner);
		if (!user && create) this.users.set(owner, user = new Map());
		if (!user) return null;
		let jar = user.get(id);
		if (!jar && create) user.set(id, jar = { id, cookies: new Map() });
		return jar || null;
	}
}

function metadata(jar) {
	return {
		id: jar.id,
		cookieCount: jar.cookies.size,
		domains: [...new Set([...jar.cookies.values()].map(cookie => cookie.domain))].sort()
	};
}

function cookieKey(cookie) {
	return `${cookie.domain}\n${cookie.path}\n${cookie.name}`;
}

function requiredUser(value) {
	if (typeof value !== 'string' || !value) throw new Error('PROXY_USER_REQUIRED');
	return value;
}

function normalizeJarId(value) {
	const id = typeof value === 'string' && value ? value : 'default';
	if (!/^[A-Za-z0-9_-]{1,64}$/.test(id)) throw new Error('PROXY_JAR_ID_INVALID');
	return id;
}

module.exports = {
	ProxyCookieJarStore,
	normalizeJarId
};
