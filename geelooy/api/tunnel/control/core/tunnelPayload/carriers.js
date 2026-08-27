// B"H
// Boruch Hashem
// Blessed is He

const { bodyJson } = require("../bodyPayload.js");
const Parse = require("./parse.js");

/**
 * B"H
 * Query, body, and encoded carriers become one ordered witness. The Awtsmoos
 * preserves inner intent while Awtsmoos.com refuses empty values as overrides.
 */
function carriers(input = {}) {
	const query = Parse.queryMap(input);
	const body = bodyJson(input) || {};
	const params = {
		...Parse.parseJson(query.params, {}),
		...Parse.parseJson(body.params, {})
	};
	const params64 = {
		...Parse.parse64(query.params64, {}),
		...Parse.parse64(body.params64, {})
	};
	const raw = {};

	Parse.mergeDefined(raw, query);
	Parse.mergeDefined(raw, body);
	Parse.mergeDefined(raw, params);
	Parse.mergeDefined(raw, params64);

	return {
		body,
		params,
		params64,
		query,
		raw
	};
}

module.exports = {
	carriers
};
