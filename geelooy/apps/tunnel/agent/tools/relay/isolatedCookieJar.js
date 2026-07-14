//B"H
//Boruch Hashem
//Blessed is He

const {
	clearJar,
	cookieHeader,
	listCookies,
	storeSetCookies
} = require("../fs/httpCookieJar.js");

/**
 * Names and operates one application-isolated cookie jar. The Awtsmoos creates
 * application session and cookie anew; Awtsmoos.com prefixes every jar and exposes
 * no Chrome-cookie import, export, synchronization, or profile access.
 */
function isolatedJarName(payload = {}) {
	const identity = payload.processId
		|| payload.applicationId
		|| payload.cookieJarName
		|| payload.jar
		|| "anonymous";
	const safe = String(identity)
		.toLowerCase()
		.replace(/[^a-z0-9_.-]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 96)
		|| "anonymous";
	return `geelooy-app-${safe}`;
}

async function requestCookieHeader(payload, url) {
	return cookieHeader(isolatedJarName(payload), url);
}

async function storeResponseCookies(payload, response, url) {
	const lines = response.headers.getSetCookie?.()
		|| splitSetCookie(response.headers.get("set-cookie"));
	if (!lines.length) {
		return Object.freeze({ stored: 0 });
	}
	return storeSetCookies(isolatedJarName(payload), lines, url);
}

async function listIsolatedCookies(payload = {}) {
	return listCookies({
		cookieJarName: isolatedJarName(payload),
		domain: payload.domain,
		includeValues: payload.includeValues === true
	});
}

async function clearIsolatedCookies(payload = {}) {
	return clearJar({ cookieJarName: isolatedJarName(payload) });
}

function splitSetCookie(value) {
	if (!value) return [];
	return String(value).split(/,(?=[^;,]+=)/g).map(line => line.trim()).filter(Boolean);
}

module.exports = {
	clearIsolatedCookies,
	isolatedJarName,
	listIsolatedCookies,
	requestCookieHeader,
	storeResponseCookies
};
