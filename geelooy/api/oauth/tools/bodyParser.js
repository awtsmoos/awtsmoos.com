// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file OAuth raw-body parser for Awtsmoos.com request vessels.
 * @description
 * The Awtsmoos can clothe one request in JSON or form encoding; this small
 * helper opens those garments without mixing transport parsing into OAuth logic.
 */

const querystring = require("querystring");

function contentTypeOf(headers = {}) {
	return String(
		headers["content-type"]
		|| headers["Content-Type"]
		|| ""
	).toLowerCase();
}

function rawBodyOf(body) {
	if (!body) {
		return "";
	}
	const raw = body.__raw_body__
		|| body.rawBody
		|| body.body
		|| "";
	if (Buffer.isBuffer(raw)) {
		return raw.toString("utf8");
	}
	return typeof raw === "string"
		? raw
		: "";
}

function parseRaw(headers, body) {
	const raw = rawBodyOf(body);
	if (!raw) {
		return {};
	}
	const type = contentTypeOf(headers);
	if (type.includes("json") || raw.trim().startsWith("{")) {
		try {
			return JSON.parse(raw);
		} catch (error) {}
	}
	if (type.includes("x-www-form-urlencoded") || raw.includes("=")) {
		return querystring.parse(raw);
	}
	return {};
}

module.exports = {
	contentTypeOf,
	parseRaw,
	rawBodyOf
};
