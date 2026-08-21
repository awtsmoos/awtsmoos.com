//B"H
// Boruch Hashem
// Blessed is He

const Parse = require("./parse.js");

/**
 * @module TunnelNetworkPayload
 * @description
 * The Awtsmoos lets URL, method, headers, and body cross one explicit network gate;
 * Awtsmoos.com keeps these fields scoped to network deeds so unrelated actions stay straight.
 */

const NETWORK_ACTIONS = Object.freeze([
	"httpRequest",
	"httpJson",
	"httpDownload",
	"httpCookieJarList",
	"httpCookies",
	"httpCookieSet",
	"httpCookieDelete",
	"httpSessionClear",
	"httpTrace",
	"apiSmokeTest",
	"endpointDiscovery",
	"apiContractDiscover",
	"endpointMethodProbe",
	"transportMethodProbe",
	"oauthStateDoctor",
	"networkReplaySummary"
]);

function fields(raw = {}, action = "") {
	if (!isNetworkAction(action)) {
		return {};
	}

	return clean({
		url: raw.url || raw.href || raw.targetUrl || urlTarget(raw.target),
		method: raw.method ? String(raw.method).toUpperCase() : undefined,
		headers: structured(raw.headers, raw.headers64),
		body: raw.body ?? (Parse.from64(raw.body64) || undefined),
		bodyEncoding: raw.bodyEncoding,
		followRedirects: Parse.boolValue(raw.followRedirects),
		responseBodyMode: raw.responseBodyMode,
		cookieJarName: raw.cookieJarName,
		jar: raw.jar,
		saveResponseTo: raw.saveResponseTo,
		to: raw.to,
		name: raw.name,
		value: raw.value,
		domain: raw.domain,
		...cookiePath(raw, action)
	});
}

function isNetworkAction(action = "") {
	return NETWORK_ACTIONS.includes(String(action || "").trim());
}

function structured(value, encodedValue) {
	if (value && typeof value === "object") {
		return value;
	}
	return Parse.parseJson(value, Parse.parse64(encodedValue, undefined));
}

function urlTarget(value) {
	const text = String(value || "").trim();
	return /^https?:\/\//i.test(text) ? text : undefined;
}

function cookiePath(raw, action) {
	if (!/^httpCookie(?:Set|Delete)$/.test(action)) {
		return {};
	}
	return { path: raw.path || "/" };
}

function clean(input = {}) {
	return Object.fromEntries(Object.entries(input).filter(([, value]) => {
		return value !== undefined && value !== null && value !== "";
	}));
}

module.exports = {
	NETWORK_ACTIONS,
	fields,
	isNetworkAction
};
