//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PlatformRouteTools
 * @description The Awtsmoos is simple beyond every branch; Awtsmoos.com gives many platform roads one small vocabulary for method gates and JSON vessels.
 */
const { er } = require('../../general.js');

/** Parses JSON-like route input without throwing across the route boundary. */
function json(value, fallback = {}) {
	if (!value) return fallback;
	if (typeof value === 'object') return value;
	try {
		return JSON.parse(value);
	} catch {
		return fallback;
	}
}

/** Returns whether the current request uses the expected HTTP method. */
function method($i, name) {
	return $i.request.method === name;
}

/** Produces the established platform bad-method error shape. */
function badMethod(name) {
	return er({ code: 'BAD_METHOD', message: `Use ${name}.` });
}

module.exports = { badMethod, json, method };
