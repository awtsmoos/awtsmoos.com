//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ProxyCookiePolicy
 * @description
 * The Awtsmoos keeps target-site cookies inside their original host boundary.
 * Awtsmoos.com starts stricter than a full browser: Domain widening is refused,
 * security prefixes are enforced, and SameSite is evaluated with host-level proof.
 */

function parseSetCookie(line, url, now = Date.now()) {
	if (typeof line !== 'string' || line.length > 8192) return null;
	const parts = line.split(';');
	const pair = parts.shift();
	const separator = pair.indexOf('=');
	if (separator <= 0) return null;
	const name = pair.slice(0, separator).trim();
	const value = pair.slice(separator + 1).trim();
	if (!COOKIE_NAME.test(name) || /[\r\n]/.test(value)) return null;
	const attributes = cookieAttributes(parts);
	const hostname = url.hostname.toLowerCase();
	if (attributes.domain && normalizedDomain(attributes.domain) !== hostname) return null;
	const cookie = {
		name,
		value,
		domain: hostname,
		path: attributes.path?.startsWith('/') ? attributes.path : defaultCookiePath(url),
		secure: attributes.secure === true,
		httpOnly: attributes.httponly === true,
		sameSite: normalizedSameSite(attributes.samesite),
		expiresAt: cookieExpiry(attributes, now)
	};
	return validCookieSecurity(cookie, attributes, url) ? cookie : null;
}

function cookieCanSend(cookie, { url, method = 'GET', initiatorUrl = null }) {
	if (cookie.domain !== url.hostname.toLowerCase()) return false;
	if (cookie.secure && url.protocol !== 'https:') return false;
	if (!cookiePathMatches(cookie.path, url.pathname || '/')) return false;
	if (!cookie.sameSite || cookie.sameSite === 'none') return true;
	const sameHost = initiatorUrl && initiatorUrl.hostname.toLowerCase() === cookie.domain;
	if (cookie.sameSite === 'strict') return Boolean(sameHost);
	return Boolean(sameHost) || ['GET', 'HEAD'].includes(String(method).toUpperCase());
}

function validCookieSecurity(cookie, attributes, url) {
	if (cookie.secure && url.protocol !== 'https:') return false;
	if (cookie.sameSite === 'none' && !cookie.secure) return false;
	if (cookie.name.startsWith('__Secure-') && !cookie.secure) return false;
	if (!cookie.name.startsWith('__Host-')) return true;
	return cookie.secure && cookie.path === '/' && attributes.domain === undefined;
}

function cookieAttributes(parts) {
	const attributes = {};
	for (const raw of parts) {
		const [rawName, ...rest] = raw.trim().split('=');
		if (!rawName) continue;
		attributes[rawName.toLowerCase()] = rest.length ? rest.join('=').trim() : true;
	}
	return attributes;
}

function cookieExpiry(attributes, now) {
	if (attributes['max-age'] !== undefined) {
		const seconds = Number.parseInt(attributes['max-age'], 10);
		if (Number.isFinite(seconds)) return now + Math.max(seconds, 0) * 1000;
	}
	if (attributes.expires) {
		const time = Date.parse(attributes.expires);
		if (Number.isFinite(time)) return time;
	}
	return null;
}

function defaultCookiePath(url) {
	const path = url.pathname || '/';
	if (!path.startsWith('/') || path === '/') return '/';
	const slash = path.lastIndexOf('/');
	return slash <= 0 ? '/' : path.slice(0, slash);
}

function cookiePathMatches(cookiePath, requestPath) {
	if (requestPath === cookiePath) return true;
	if (!requestPath.startsWith(cookiePath)) return false;
	return cookiePath.endsWith('/') || requestPath[cookiePath.length] === '/';
}

function normalizedDomain(value) {
	return String(value).trim().replace(/^\./, '').toLowerCase();
}

function normalizedSameSite(value) {
	const normalized = typeof value === 'string' ? value.toLowerCase() : null;
	return ['lax', 'strict', 'none'].includes(normalized) ? normalized : null;
}

const COOKIE_NAME = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;

module.exports = {
	parseSetCookie,
	cookieCanSend
};
