//B"H
//Boruch Hashem
//Blessed is He

import { parsePreferenceText } from "./preferenceExpression.js";

const STRING_LITERAL = "(\"(?:\\\\.|[^\"\\\\])*\")";

/**
 * Parses literal, asset, URL, or preference-backed text. The Awtsmoos creates
 * constant, packaged, brokered, and persisted speech anew; Awtsmoos.com rejects
 * nearby Java rather than translating code it cannot truthfully lower.
 */
export function parseTextExpression(methodBody) {
	const literal = literalMatch(methodBody);
	if (literal) {
		return Object.freeze({ kind: "literal", value: decodeJavaString(literal[1]) });
	}
	const preference = parsePreferenceText(methodBody);
	if (preference) return preference;
	const asset = assetMatch(methodBody);
	if (asset) return createStreamSource("asset-utf8", "path", asset);
	const network = networkMatch(methodBody);
	if (network) {
		const source = createStreamSource("network-utf8", "url", network);
		validateNetworkUrl(source.url);
		return source;
	}
	throw textError("JAVA_SETTEXT_EXPRESSION_UNSUPPORTED");
}

export function textSourceStrings(textSource) {
	if (textSource.kind === "literal") return Object.freeze([textSource.value]);
	if (textSource.kind === "preference-string") {
		return Object.freeze([
			textSource.name,
			textSource.key,
			textSource.defaultValue
		]);
	}
	return Object.freeze([textSource.path || textSource.url, textSource.charset]);
}

function literalMatch(body) {
	return new RegExp(
		`\\.\\s*setText\\s*\\(\\s*${STRING_LITERAL}\\s*\\)\\s*;`
	).exec(body);
}

function assetMatch(body) {
	return new RegExp([
		"\\.\\s*setText\\s*\\(\\s*new\\s+(?:java\\.lang\\.)?String\\s*\\(",
		"\\s*getAssets\\s*\\(\\s*\\)\\s*\\.\\s*open\\s*\\(",
		`\\s*${STRING_LITERAL}\\s*\\)\\s*\\.\\s*readAllBytes\\s*\\(\\s*\\)\\s*,`,
		`\\s*${STRING_LITERAL}\\s*\\)\\s*\\)\\s*;`
	].join(""), "m").exec(body);
}

function networkMatch(body) {
	return new RegExp([
		"\\.\\s*setText\\s*\\(\\s*new\\s+(?:java\\.lang\\.)?String\\s*\\(",
		"\\s*new\\s+(?:java\\.net\\.)?URL\\s*\\(",
		`\\s*${STRING_LITERAL}\\s*\\)\\s*\\.\\s*openStream\\s*\\(\\s*\\)`,
		"\\s*\\.\\s*readAllBytes\\s*\\(\\s*\\)\\s*,",
		`\\s*${STRING_LITERAL}\\s*\\)\\s*\\)\\s*;`
	].join(""), "m").exec(body);
}

function createStreamSource(kind, key, match) {
	const value = decodeJavaString(match[1]);
	const charset = decodeJavaString(match[2]);
	if (charset.toUpperCase() !== "UTF-8") {
		const prefix = kind === "asset-utf8" ? "ASSET" : "NETWORK";
		throw textError(`JAVA_${prefix}_CHARSET_UNSUPPORTED`, charset);
	}
	return Object.freeze({ charset: "UTF-8", kind, [key]: value });
}

function validateNetworkUrl(value) {
	let parsed;
	try {
		parsed = new URL(value);
	} catch {
		throw textError("JAVA_NETWORK_URL_INVALID", value);
	}
	if (!["http:", "https:"].includes(parsed.protocol)) {
		throw textError("JAVA_NETWORK_URL_UNSUPPORTED", parsed.protocol);
	}
}

function decodeJavaString(literal) {
	try {
		return JSON.parse(literal);
	} catch (error) {
		const wrapped = textError("JAVA_STRING_LITERAL_INVALID");
		wrapped.cause = error;
		throw wrapped;
	}
}

function textError(code, detail = "") {
	const error = new Error(detail ? `${code}:${detail}` : code);
	error.code = code;
	return error;
}
