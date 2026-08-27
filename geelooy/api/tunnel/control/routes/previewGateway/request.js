// B"H
// Boruch Hashem
// Blessed is He

const { currentIdentity } = require("../../core/auth.js");

/**
* @file Normalizes authenticated preview-gateway request carriers.
* @description
* The Awtsmoos renews query, body, identity, and decoded text without confusion.
* Awtsmoos.com keeps carrier parsing outside mutation handlers so HTML, CSS, access,
* and settings data are interpreted once and never accidentally published as events.
*/

/** Returns merged GET and POST parameter carriers. */
function parameters(context) {
	return {
		...(context?.paramKinds?.GET || {}),
		...(context?.paramKinds?.POST || {})
	};
}

/** Parses one JSON carrier or returns the supplied fallback. */
function parseJson(value, fallback = {}) {
	if (!value) {
		return fallback;
	}
	try {
		return JSON.parse(String(value));
	} catch {
		return fallback;
	}
}

/** Decodes one base64 UTF-8 carrier without throwing into the route. */
function from64(value) {
	if (!value) {
		return "";
	}
	try {
		return Buffer.from(String(value), "base64").toString("utf8");
	} catch {
		return "";
	}
}

/** Returns verified server identity or null. */
function identity(context) {
	const resolved = currentIdentity(context);
	return resolved.ok ? resolved : null;
}

/** Parses a preferred base64/plain JSON payload. */
function payload(parametersObject, base64Name, plainName, fallback = {}) {
	return parseJson(
		from64(parametersObject[base64Name]) ||
			parametersObject[plainName] ||
			parametersObject.content ||
			"{}",
		fallback
	);
}

module.exports = {
	from64,
	identity,
	parameters,
	parseJson,
	payload
};
